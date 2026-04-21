import { Category, NewsArticle } from '../types';

// Category centroids in 20D embedding space
// Designed so related categories share some dimensions (realistic overlap)
const CENTROIDS: Record<Category, number[]> = {
  politics:      [1.0, 0.8, 0.0, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.3, 0.0, 0.0, 0.0],
  technology:    [0.0, 0.1, 1.0, 0.8, 0.0, 0.3, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.7, 0.0, 0.3, 0.0, 0.0, 0.2, 0.0],
  climate:       [0.2, 0.0, 0.3, 0.0, 1.0, 0.8, 0.0, 0.0, 0.0, 0.4, 0.0, 0.0, 0.0, 0.0, 0.0, 0.6, 0.0, 0.7, 0.0, 0.0],
  health:        [0.0, 0.0, 0.3, 0.0, 0.2, 0.0, 1.0, 0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.4, 0.0, 0.0, 0.0, 0.0],
  economy:       [0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.9, 0.0, 0.0, 0.4, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  sports:        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.9, 0.0, 0.0, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0],
  entertainment: [0.0, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3, 0.2, 1.0, 0.0, 0.8, 0.0, 0.0, 0.0, 0.0, 0.7],
  science:       [0.0, 0.0, 0.6, 0.2, 0.4, 0.0, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3, 0.0, 1.0, 0.0, 0.3, 0.8, 0.0],
};

const ARTICLES_BY_CATEGORY: Record<Category, Array<{ title: string; summary: string; source: string }>> = {
  politics: [
    { title: 'Senate Passes Sweeping Infrastructure Reform Bill', summary: 'Bipartisan legislation earmarks $1.2T for roads, broadband, and clean water projects over the next decade.', source: 'Reuters' },
    { title: 'UN Security Council Meets Over Regional Tensions', summary: 'Emergency session called after escalating border disputes raise international concerns.', source: 'AP News' },
    { title: 'Presidential Approval Ratings Hit Six-Month High', summary: 'New polling data shows broad support following recent domestic policy wins.', source: 'Politico' },
    { title: 'Trade Negotiations Resume Between Major Economies', summary: 'Representatives from G7 nations converge in Geneva for critical tariff discussions.', source: 'BBC News' },
    { title: 'Election Commission Announces Voter Registration Drive', summary: 'Nationwide initiative aims to add 15 million new registered voters ahead of midterms.', source: 'NPR' },
    { title: 'Foreign Policy Shift Signals New Diplomatic Era', summary: 'State Department outlines revamped approach to multilateral alliances.', source: 'Foreign Affairs' },
    { title: 'Supreme Court Agrees to Hear Landmark Civil Rights Case', summary: 'Ruling expected to have far-reaching implications for employment law.', source: 'NYT' },
    { title: 'Congress Debates National Cybersecurity Standards', summary: 'Lawmakers clash over federal versus state jurisdiction in digital infrastructure protection.', source: 'Wired' },
    { title: 'Local Governments Push Back on Federal Housing Mandates', summary: 'Coalition of mayors argues new density requirements undermine local zoning authority.', source: 'CityLab' },
    { title: 'Whistleblower Allegations Prompt Oversight Investigation', summary: 'Congressional committee subpoenas documents related to defense contractor payments.', source: 'The Guardian' },
  ],
  technology: [
    { title: 'New AI Model Surpasses Human Performance on Complex Reasoning Tasks', summary: 'Benchmark results show the latest large language model outperforming experts in scientific problem-solving.', source: 'MIT Tech Review' },
    { title: 'Semiconductor Shortage Eases as New Fab Facilities Come Online', summary: 'Global chip supply stabilizes after years of disruption fueled by pandemic-era demand spikes.', source: 'Bloomberg Tech' },
    { title: 'Quantum Computing Milestone Achieved by Research Consortium', summary: 'Team demonstrates 1,000-qubit stable operation, a key threshold for practical applications.', source: 'Nature' },
    { title: 'Major Social Platform Rolls Out End-to-End Encryption', summary: 'Privacy advocates applaud the move while regulators raise concerns about law enforcement access.', source: 'The Verge' },
    { title: 'Autonomous Vehicle Fleet Expands to 12 New Cities', summary: 'Robotaxi company reports significant safety improvements after latest software update.', source: 'TechCrunch' },
    { title: 'Open-Source AI Framework Adopted by Thousands of Enterprises', summary: 'Developer community rallies around new standard for building reproducible ML pipelines.', source: 'GitHub Blog' },
    { title: 'Wearable Brain-Computer Interface Enters Clinical Trials', summary: 'Non-invasive device could restore motor function for patients with spinal cord injuries.', source: 'IEEE Spectrum' },
    { title: 'Cloud Provider Announces 40% Carbon-Neutral Data Centers', summary: 'Green energy initiatives reduce operational emissions while expanding capacity.', source: 'VentureBeat' },
    { title: 'Generative AI Tools Transform Software Development Workflow', summary: 'Developers report 30% productivity gains using AI-assisted coding environments.', source: 'Stack Overflow' },
    { title: 'New Internet Protocol Promises 10x Speed Improvements', summary: 'QUIC-based successor to HTTP/3 enters final standardization stages at IETF.', source: 'Ars Technica' },
  ],
  climate: [
    { title: 'Arctic Ice Sheet Records Lowest Summer Extent in Modern History', summary: 'Satellite data confirms alarming trend as scientists warn of accelerating feedback loops.', source: 'Nature Climate Change' },
    { title: 'Solar Panel Efficiency Record Broken by University Lab', summary: 'New perovskite-silicon tandem cell achieves 33.7% conversion efficiency.', source: 'Science Daily' },
    { title: 'Major Nations Commit to Methane Reduction Targets at Climate Summit', summary: 'Over 80 countries sign pledge to cut methane emissions 30% by 2030.', source: 'BBC Environment' },
    { title: 'Carbon Capture Plant Goes Live in Industrial Heartland', summary: 'Direct air capture facility removes CO₂ from atmosphere at unprecedented scale.', source: 'CleanTechnica' },
    { title: 'Coral Reef Restoration Project Shows Promising Early Results', summary: 'Genetically resilient coral strains survive bleaching events in controlled ocean trials.', source: 'NOAA' },
    { title: 'Wildfire Season Extends as Drought Grips Western Regions', summary: 'Fire management agencies scramble resources amid record burn acreage.', source: 'LA Times' },
    { title: 'Offshore Wind Farm Network to Power 5 Million Homes', summary: 'Largest-ever North Sea installation breaks ground with government backing.', source: 'Reuters Energy' },
    { title: 'Agricultural Sector Adapts Planting Schedules to Shifting Climate Zones', summary: 'Farmers adopt new crop varieties as traditional growing seasons become unreliable.', source: 'Grist' },
    { title: 'Urban Heat Island Effect Worsens Public Health Outcomes', summary: 'Study links rising city temperatures to increased hospitalizations during summer months.', source: 'The Lancet' },
    { title: 'Battery Storage Breakthrough Could Stabilize Renewable Grids', summary: 'Solid-state grid battery cells achieve 10,000 charge cycles without degradation.', source: 'Energy Monitor' },
  ],
  health: [
    { title: 'mRNA Vaccine Platform Shows Promise Against Multiple Cancer Types', summary: 'Phase II trial results suggest personalized cancer vaccines can trigger durable immune responses.', source: 'NEJM' },
    { title: 'WHO Declares End to Multi-Year Respiratory Illness Outbreak', summary: 'Global health authorities confirm containment after coordinated international response.', source: 'WHO Bulletin' },
    { title: 'Alzheimer\'s Drug Candidate Clears Key Late-Stage Trial', summary: 'Phase III data shows 35% reduction in cognitive decline over 18-month study period.', source: 'Nature Medicine' },
    { title: 'Mental Health Crisis Among Adolescents Prompts Policy Response', summary: 'Federal task force recommends universal school-based screening programs.', source: 'JAMA' },
    { title: 'Antibiotic-Resistant Bacteria Spreading Faster Than Projected', summary: 'CDC report warns of "silent pandemic" with 700,000 deaths annually by 2030.', source: 'CDC' },
    { title: 'Wearable Device Detects Atrial Fibrillation with 98% Accuracy', summary: 'Consumer health wearable FDA-cleared for cardiac monitoring in at-risk patients.', source: 'Circulation' },
    { title: 'Universal Health Coverage Expands in Developing Nations', summary: 'New funding models help low-income countries achieve 80% primary care access targets.', source: 'Lancet Global Health' },
    { title: 'Gut Microbiome Research Uncovers Link to Neurological Disorders', summary: 'Longitudinal study maps bacterial communities to Parkinson\'s disease onset.', source: 'Cell' },
    { title: 'Telemedicine Adoption Becomes Permanent Post-Pandemic Feature', summary: 'Insurers and hospitals expand virtual care infrastructure as patient satisfaction soars.', source: 'Health Affairs' },
    { title: 'Gene Therapy Trials Restore Vision in Inherited Blindness Patients', summary: 'CRISPR-based intervention shows full restoration of light perception in six participants.', source: 'NEJM' },
  ],
  economy: [
    { title: 'Central Bank Holds Interest Rates Steady Amid Inflation Concerns', summary: 'Monetary policy committee signals caution as consumer price growth remains above target.', source: 'WSJ' },
    { title: 'Global Supply Chain Resilience Index Rebounds to Pre-Crisis Levels', summary: 'Manufacturing diversification and nearshoring strategies pay off for multinationals.', source: 'Financial Times' },
    { title: 'Tech Sector Layoffs Slow as AI Hiring Surge Offsets Cuts', summary: 'Labor market data shows net job growth in software and ML engineering roles.', source: 'Bloomberg' },
    { title: 'Housing Market Shows Signs of Cooling in Overheated Metros', summary: 'Price growth moderates as mortgage rates remain elevated and inventory rises.', source: 'Zillow Research' },
    { title: 'Emerging Market Currencies Strengthen on Commodity Price Rally', summary: 'Copper, lithium, and rare earth metal demand drives export revenues higher.', source: 'IMF Blog' },
    { title: 'Small Business Confidence Index Hits Two-Year High', summary: 'Easing credit conditions and consumer spending support optimistic outlook.', source: 'NFIB' },
    { title: 'IPO Market Revives with Wave of Tech and Biotech Listings', summary: 'Investor appetite returns as market volatility subsides and valuations reset.', source: 'Reuters Finance' },
    { title: 'Digital Currency Adoption Accelerates Among Central Banks', summary: 'Over 30 nations in active CBDC pilots, with 5 launching full commercial rollouts.', source: 'BIS' },
    { title: 'Corporate Tax Reform Proposal Divides Business Groups', summary: 'Proposed minimum corporate rate sparks debate over competitiveness and fairness.', source: 'Tax Policy Center' },
    { title: 'Retail Sales Beat Expectations as Consumer Spending Holds Strong', summary: 'Discretionary spending rises despite higher borrowing costs, puzzling economists.', source: 'Commerce Dept.' },
  ],
  sports: [
    { title: 'Championship Finals Draw Record Global Viewership', summary: 'Streaming and broadcast audiences combined to break all-time record with 2.1 billion viewers.', source: 'ESPN' },
    { title: 'Star Athlete Signs Historic Multi-Year Endorsement Deal', summary: 'Record-breaking contract reshapes the economics of sports marketing.', source: 'Sports Illustrated' },
    { title: 'New Stadium Opens with Cutting-Edge Fan Experience Technology', summary: 'AI-powered concessions and augmented reality seats debut to sold-out crowds.', source: 'SportsPro' },
    { title: 'Olympic Committee Announces Host City for 2032 Games', summary: 'Selection follows extensive evaluation of infrastructure, sustainability, and economic impact.', source: 'IOC' },
    { title: 'Performance Analytics Reshapes Athlete Training Programs', summary: 'Biometric monitoring and machine learning optimize recovery and prevent injury.', source: 'The Athletic' },
    { title: 'Youth Sports Participation Rebounds After Pandemic Decline', summary: 'Registration numbers exceed pre-2020 levels as programs expand community access.', source: 'Sports & Fitness Industry' },
    { title: 'Formula E Championship Expands to Five New Markets', summary: 'Electric racing series gains traction as automakers increase investment.', source: 'Motorsport.com' },
    { title: 'Women\'s League Broadcasts Attract Largest-Ever Audiences', summary: 'Viewership records broken in soccer, basketball, and tennis as fan bases grow rapidly.', source: 'SBJ' },
    { title: 'Anti-Doping Agency Introduces Real-Time Testing Protocol', summary: 'New biological passport system detects banned substances within hours of competition.', source: 'WADA' },
    { title: 'Esports Revenue Surpasses Traditional Sports League Benchmarks', summary: 'Global competitive gaming market tops $3B as institutional investors pour in capital.', source: 'Newzoo' },
  ],
  entertainment: [
    { title: 'Streaming Wars Intensify as Platforms Consolidate and Pivot', summary: 'Major studios merge services to cut costs and retain subscribers amid saturation.', source: 'Variety' },
    { title: 'AI-Generated Music Sparks Copyright Royalty Debate', summary: 'Industry groups call for new legal frameworks as synthetic tracks top streaming charts.', source: 'Billboard' },
    { title: 'Box Office Breaks Summer Records with Franchise Sequel', summary: 'Blockbuster earns $350M opening weekend, reviving confidence in theatrical releases.', source: 'Hollywood Reporter' },
    { title: 'Virtual Concert Platform Hosts 10 Million Concurrent Fans', summary: 'Immersive digital performance sets new benchmark for live entertainment experiences.', source: 'Rolling Stone' },
    { title: 'Award Season Dominated by International Productions', summary: 'Global streaming has democratized prestige storytelling, say critics and industry insiders.', source: 'IndieWire' },
    { title: 'Interactive Narrative Game Wins Cultural Impact Award', summary: 'Story-driven title recognized for its portrayal of mental health and social justice themes.', source: 'IGN' },
    { title: 'Podcast Industry Reaches 500 Million Active Listeners Globally', summary: 'Monetization models evolve as advertisers follow audiences to audio-first content.', source: 'Spotify Insights' },
    { title: 'Celebrity Fashion Line Disrupts Luxury Market with Direct-to-Consumer Model', summary: 'Star-backed brand bypasses retailers and grows revenue 300% in first year.', source: 'WWD' },
    { title: 'Book Adaptation Pipeline Fuels Battle for Publishing Rights', summary: 'Streamers bid aggressively for literary IP as original screenwriting costs climb.', source: 'Publishers Weekly' },
    { title: 'Independent Film Festival Announces Expanded Global Lineup', summary: 'Record submissions reflect growing global appetite for boundary-pushing cinema.', source: 'Sundance' },
  ],
  science: [
    { title: 'James Webb Telescope Reveals Atmosphere of Potentially Habitable Exoplanet', summary: 'Spectroscopic data suggests presence of water vapor and carbon dioxide in distant world.', source: 'NASA' },
    { title: 'Physicists Observe New Subatomic Particle at Particle Collider', summary: 'Experimental confirmation of theorized particle opens new chapter in Standard Model research.', source: 'CERN' },
    { title: 'Ancient DNA Analysis Rewrites Early Human Migration History', summary: 'Genomic evidence pushes back date of out-of-Africa dispersal by 40,000 years.', source: 'Science' },
    { title: 'Room-Temperature Superconductor Claim Under Peer Review', summary: 'Independent labs attempt replication of landmark material science result.', source: 'Physical Review Letters' },
    { title: 'Synthetic Biology Team Engineers Drought-Resistant Crop Strain', summary: 'Gene-editing approach borrowed from extremophile bacteria enhances water retention in maize.', source: 'PNAS' },
    { title: 'Deep Sea Expedition Discovers Dozen New Species in Unexplored Trench', summary: 'ROV footage captures bioluminescent organisms at record depths in Pacific Ocean.', source: 'Oceanography' },
    { title: 'Brain Organoid Research Raises Ethical Questions About Consciousness', summary: 'Lab-grown neural tissue exhibits unexpected electrical activity patterns, prompting bioethics debate.', source: 'Nature Neuroscience' },
    { title: 'Fusion Energy Reactor Achieves Net Energy Gain for Third Consecutive Time', summary: 'Consistent results boost confidence in commercial timeline for clean fusion power.', source: 'DOE' },
    { title: 'Mathematical Proof of Long-Standing Topology Conjecture Published', summary: 'Fields Medal favorite solves 60-year-old problem with novel geometric approach.', source: 'Annals of Mathematics' },
    { title: 'Biodiversity Survey Finds Ecosystem Recovery in Protected Marine Zones', summary: 'Fish populations and coral coverage rebound significantly in no-take marine reserves.', source: 'Conservation Biology' },
  ],
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateEmbedding(category: Category, articleIndex: number): number[] {
  const rng = seededRandom(category.charCodeAt(0) * 100 + articleIndex * 1337);
  const centroid = CENTROIDS[category];
  const noise = 0.18;
  return centroid.map(v => v + (rng() - 0.5) * noise * 2);
}

function daysAgo(days: number, rng: () => number): Date {
  const now = new Date('2026-04-21');
  const ms = days * 24 * 60 * 60 * 1000;
  now.setTime(now.getTime() - rng() * ms);
  return now;
}

let idCounter = 0;

export function generateNewsArticles(): NewsArticle[] {
  const articles: NewsArticle[] = [];
  idCounter = 0;

  (Object.keys(ARTICLES_BY_CATEGORY) as Category[]).forEach((category) => {
    const rng = seededRandom(category.charCodeAt(0) * 7);
    ARTICLES_BY_CATEGORY[category].forEach((raw, i) => {
      articles.push({
        id: `article-${++idCounter}`,
        title: raw.title,
        summary: raw.summary,
        category,
        source: raw.source,
        timestamp: daysAgo(30, rng),
        embedding: generateEmbedding(category, i),
      });
    });
  });

  return articles;
}
