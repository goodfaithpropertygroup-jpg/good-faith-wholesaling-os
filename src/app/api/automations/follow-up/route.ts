import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

    const supabase = createServiceClient();

    try {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

          const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .in('status', ['new', 'contacted', 'follow_up'])
            .lt('last_contact_date', threeDaysAgo.toISOString())
            .limit(50);

          if (error) throw error;
          if (!leads || leads.length === 0) {
                  return NextResponse.json({ message: 'No leads need follow-up', count: 0 });
                }

          const results = [];

          for (const lead of leads) {
                  if (!lead.email) continue;

                  const { error: emailError } = await resend.emails.send({
                            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                            to: lead.email,
                            subject: `Following up on your property - Good Faith Property Group`,
                            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><h2>Hi ${lead.first_name || 'there'},</h2><p>Just following up on your property at <strong>${lead.address}</strong>. We are still very interested in making you a fair cash offer.</p><p>Reply to this email anytime.</p><br/><p>Good Faith Property Group</p></div>`,
                          });

                  if (!emailError) {
                            await supabase.from('leads').update({ last_contact_date: new Date().toISOString(), status: 'follow_up' }).eq('id', lead.id);
                            await supabase.from('automation_logs').insert([{ action_type: 'follow_up_email', lead_id: lead.id, status: 'success', notes: `Email sent to ${lead.email}` }]);
                            results.push({ lead_id: lead.id, status: 'sent' });
                          } else {
                            results.push({ lead_id: lead.id, status: 'failed' });
                          }
                }

          return NextResponse.json({ message: 'Follow-up automation complete', processed: leads.length, results });
        } catch (error: any) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
  }
