import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

    const supabase = createServerSupabaseClient();

    try {
          // Get all cash buyers
          const { data: buyers, error } = await supabase
            .from('cash_buyers')
            .select('*, buyer_offers(*)');

          if (error) throw error;
          if (!buyers || buyers.length === 0) {
                  return NextResponse.json({ message: 'No buyers to rank', count: 0 });
                }

          const updates = [];

          for (const buyer of buyers) {
                  const offers = buyer.buyer_offers || [];

                  // Scoring algorithm
                  let score = 50; // Base score

                  // +10 points for each offer made
                  score += Math.min(offers.length * 10, 30);

                  // +20 if buyer has proof of funds
                  if (buyer.proof_of_funds) score += 20;

                  // +10 if they closed a deal recently (within 90 days)
                  const recentClose = offers.find((o: any) => {
                            if (o.status !== 'closed') return false;
                            const closeDate = new Date(o.updated_at);
                            const ninetyDaysAgo = new Date();
                            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                            return closeDate > ninetyDaysAgo;
                          });
                  if (recentClose) score += 10;

                  // -10 if buyer is inactive
                  if (buyer.status === 'inactive') score -= 10;

                  // Cap at 100
                  score = Math.min(Math.max(score, 0), 100);

                  updates.push({ id: buyer.id, rank_score: score });
                }

          // Batch update all buyer scores
          for (const update of updates) {
                  await supabase
                    .from('cash_buyers')
                    .update({ rank_score: update.rank_score })
                    .eq('id', update.id);
                }

          await supabase.from('automation_logs').insert([{
                  action_type: 'rank_buyers',
                  status: 'success',
                  notes: `Ranked ${updates.length} buyers`,
                }]);

          return NextResponse.json({
                  message: 'Buyer ranking complete',
                  buyers_ranked: updates.length,
                  updates,
                });

        } catch (error: any) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
  }
