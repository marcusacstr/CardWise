import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SAMPLE_CARDS = [
  {
    card_name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    card_image_url: 'https://creditcards.chase.com/K-Marketplace/images/cardart/sapphire_preferred_card.png',
    annual_fee: 95,
    intro_apr: '0% for 12 months',
    regular_apr: '20.49% - 27.49% Variable',
    intro_bonus: '60,000 bonus points',
    bonus_requirement: 'after you spend $4,000 on purchases in the first 3 months',
    rewards_rate: '2X points on travel and dining, 1X on everything else',
    rewards_type: 'Travel Rewards',
    key_benefits: ['No foreign transaction fees', '25% more value when you redeem through Chase Ultimate Rewards', 'Trip cancellation/interruption insurance', 'Primary rental car coverage'],
    best_for: 'Travel enthusiasts who want premium rewards',
    country: 'US'
  },
  {
    card_name: 'Capital One Venture Rewards',
    issuer: 'Capital One',
    card_image_url: 'https://ecm.capitalone.com/WCM/card/products/venture-card-art.png',
    annual_fee: 95,
    intro_apr: '0% for 12 months',
    regular_apr: '19.49% - 29.49% Variable',
    intro_bonus: '75,000 miles',
    bonus_requirement: 'after spending $4,000 in the first 3 months',
    rewards_rate: '2X miles on every purchase',
    rewards_type: 'Travel Rewards',
    key_benefits: ['No foreign transaction fees', 'Transfer partners with airlines and hotels', 'Global Entry/TSA PreCheck credit', 'Travel accident insurance'],
    best_for: 'Frequent travelers who want simple earning',
    country: 'US'
  },
  {
    card_name: 'Citi Double Cash',
    issuer: 'Citi',
    card_image_url: 'https://www.citi.com/CRD/images/card-art/double-cash-card.png',
    annual_fee: 0,
    intro_apr: '0% for 18 months',
    regular_apr: '18.49% - 28.49% Variable',
    intro_bonus: '$200 cash back',
    bonus_requirement: 'after spending $1,500 in the first 6 months',
    rewards_rate: '2% cash back on all purchases (1% when you buy, 1% when you pay)',
    rewards_type: 'Cash Back',
    key_benefits: ['No annual fee', 'No category restrictions', 'No rotating categories', 'Balance transfer option'],
    best_for: 'People who want simple, consistent cash back',
    country: 'US'
  },
  {
    card_name: 'American Express Gold Card',
    issuer: 'American Express',
    card_image_url: 'https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/gold-card.png',
    annual_fee: 250,
    intro_apr: 'N/A',
    regular_apr: '19.49% - 28.49% Variable',
    intro_bonus: '60,000 Membership Rewards points',
    bonus_requirement: 'after you spend $4,000 on purchases in the first 6 months',
    rewards_rate: '4X points at restaurants, 4X at US supermarkets (up to $25K/year), 3X on flights, 1X everything else',
    rewards_type: 'Dining & Grocery Rewards',
    key_benefits: ['$120 Uber Cash annually', '$120 dining credit annually', 'No foreign transaction fees', 'Purchase protection'],
    best_for: 'Foodies and frequent diners',
    country: 'US'
  },
  {
    card_name: 'Discover it Cash Back',
    issuer: 'Discover',
    card_image_url: 'https://www.discover.com/content/dam/discover/en_us/credit-cards/card-acquisitions/homepage/cardart/cardart-secured.png',
    annual_fee: 0,
    intro_apr: '0% for 14 months',
    regular_apr: '16.49% - 27.49% Variable',
    intro_bonus: 'Cashback Match',
    bonus_requirement: 'Discover will match all the cash back you earn in your first year',
    rewards_rate: '5% cash back on rotating categories (up to $1,500 each quarter), 1% on everything else',
    rewards_type: 'Cash Back',
    key_benefits: ['No annual fee', 'Free FICO credit score', 'Freeze your account instantly', '100% US-based customer service'],
    best_for: 'People who want rotating bonus categories',
    country: 'US'
  },
  {
    card_name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    card_image_url: 'https://creditcards.chase.com/K-Marketplace/images/cardart/freedom_unlimited_card.png',
    annual_fee: 0,
    intro_apr: '0% for 15 months',
    regular_apr: '19.49% - 28.49% Variable',
    intro_bonus: '$200 cash back',
    bonus_requirement: 'after you spend $500 on purchases in the first 3 months',
    rewards_rate: '1.5% cash back on all purchases',
    rewards_type: 'Cash Back',
    key_benefits: ['No annual fee', 'No category restrictions', 'Redeem for cash or transfer to travel partners', 'Cell phone protection'],
    best_for: 'People who want simple, flat-rate cash back',
    country: 'US'
  }
];

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get partner ID
    const { data: partnerData, error: partnerError } = await supabase
      .from('partners')
      .select('id, company_name')
      .eq('user_id', user.id)
      .single();
    
    if (partnerError || !partnerData) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // First, ensure sample cards exist in credit_cards table
    for (const card of SAMPLE_CARDS) {
      const { data: existingCard } = await supabase
        .from('credit_cards')
        .select('id')
        .eq('card_name', card.card_name)
        .eq('issuer', card.issuer)
        .single();

      if (!existingCard) {
        await supabase
          .from('credit_cards')
          .insert({
            ...card,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    }

    // Get all sample card IDs
    const { data: cardIds, error: cardIdsError } = await supabase
      .from('credit_cards')
      .select('id, card_name')
      .in('card_name', SAMPLE_CARDS.map(c => c.card_name));

    if (cardIdsError || !cardIds) {
      return NextResponse.json({ error: 'Failed to fetch card IDs' }, { status: 500 });
    }

    // Remove existing selections for this partner
    await supabase
      .from('partner_card_selections')
      .delete()
      .eq('partner_id', partnerData.id);

    // Add sample cards to partner's selection
    const selections = cardIds.map((card, index) => ({
      partner_id: partnerData.id,
      credit_card_id: card.id,
      affiliate_link: `https://example.com/apply/${card.card_name.toLowerCase().replace(/\s+/g, '-')}?ref=${partnerData.company_name.toLowerCase().replace(/\s+/g, '')}`,
      custom_description: `Recommended by ${partnerData.company_name} for our customers.`,
      featured: card.card_name === 'Chase Sapphire Preferred' || card.card_name === 'Citi Double Cash',
      priority_order: index + 1,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('partner_card_selections')
      .insert(selections);

    if (insertError) {
      console.error('Error inserting card selections:', insertError);
      return NextResponse.json({ error: 'Failed to set up demo cards' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Demo cards set up successfully',
      cardsAdded: cardIds.length
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 