import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { deal_id } = await request.json();
  if (!deal_id) {
    return NextResponse.json({ error: 'deal_id required' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  try {
    // Get deal details
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', deal_id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Get all active buyers with email
    const { data: buyers, error: buyersError } = await supabase
      .from('cash_buyers')
      .select('*')
      .eq('status', 'active')
      .not('email', 'is', null);

    if (buyersError) throw buyersError;
    if (!buyers || buyers.length === 0) {
      return NextResponse.json({ message: 'No active buyers to notify', count: 0 });
    }

    const results = [];
    const equity = deal.arv && deal.purchase_price ? deal.arv - deal.purchase_price : null;

    for (const buyer of buyers) {
      if (!buyer.email) continue;

      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: buyer.email,
        subject: `🏠 New Deal Available: ${deal.property_address}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e3a5f; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Good Faith Property Group</h1>
              <p style="color: #93c5fd; margin: 5px 0 0 0;">New Deal Available</p>
            </div>
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e293b;">Hi ${buyer.first_name || 'Valued Buyer'},</h2>
              <p style="color: #475569;">We have a new wholesale opportunity that matches your criteria:</p>
              
              <div style="background: white; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="color: #1e293b; margin-top: 0;">🏠 ${deal.property_address}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; width: 50%;">Purchase Price:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${deal.purchase_price ? '$' + Number(deal.purchase_price).toLocaleString() : 'Contact us'}</td>
                  </tr>
                  ${deal.arv ? `<tr>
                    <td style="padding: 8px 0; color: #64748b;">After Repair Value:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">$${Number(deal.arv).toLocaleString()}</td>
                  </tr>` : ''}
                  ${equity ? `<tr>
                    <td style="padding: 8px 0; color: #64748b;">Potential Equity:</td>
                    <td style="padding: 8px 0; color: #16a34a; font-weight: bold;">$${equity.toLocaleString()}</td>
                  </tr>` : ''}
                  ${deal.close_date ? `<tr>
                    <td style="padding: 8px 0; color: #64748b;">Close Date:</td>
                    <td style="padding: 8px 0; color: #1e293b;">${new Date(deal.close_date).toLocaleDateString()}</td>
                  </tr>` : ''}
                </table>
                ${deal.notes ? `<p style="color: #475569; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;"><strong>Notes:</strong> ${deal.notes}</p>` : ''}
              </div>
              
              <p style="color: #475569;">Reply to this email or call us to express your interest. This deal won't last long!</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #94a3b8; font-size: 12px;">Good Faith Property Group | Real Estate Wholesaling</p>
                <p style="color: #94a3b8; font-size: 12px;">You're receiving this because you're on our cash buyer list.</p>
              </div>
            </div>
          </div>
        `,
      });

      // Log to buyer_offers table
      await supabase.from('buyer_offers').insert([{
        buyer_id: buyer.id,
        deal_id: deal.id,
        status: emailError ? 'email_failed' : 'sent',
      }]);

      results.push({ buyer_id: buyer.id, email: buyer.email, success: !emailError });
    }

    // Update deal status to 'assigned' if not already
    if (deal.status === 'new' || deal.status === 'analyzing') {
      await supabase.from('deals').update({ status: 'under_contract' }).eq('id', deal_id);
    }

    // Log automation
    await supabase.from('automation_logs').insert([{
      type: 'buyer_blast',
      status: 'completed',
      details: { deal_id, buyers_notified: results.filter(r => r.success).length, total_buyers: buyers.length },
    }]);

    return NextResponse.json({
      message: 'Buyer blast sent',
      deal: deal.property_address,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      total: buyers.length,
    });

  } catch (error) {
    console.error('Buyer blast error:', error);
    return NextResponse.json({ error: 'Failed to send buyer blast' }, { status: 500 });
  }
}
