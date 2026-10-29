import { FlashcardDeck, SummaryDocument } from '../types';

export const SAMPLE_STUDY_PRESETS = [
  {
    title: 'Cellular Respiration & Energy Production',
    subject: 'Biology',
    description: 'ATP synthesis through Glycolysis, Krebs Cycle, and the Electron Transport Chain in mitochondria.',
    content: `Cellular respiration is the biochemical pathway by which organisms oxidize nutrients to generate adenosine triphosphate (ATP), the universal cellular energy currency.

Phase 1: Glycolysis
Occurs in the cytoplasm and requires no oxygen (anaerobic). A single 6-carbon glucose molecule undergoes a sequence of 10 enzymatic steps to yield two 3-carbon pyruvate molecules, generating a net gain of 2 ATP (via substrate-level phosphorylation) and 2 NADH molecules. Key regulatory enzyme: Phosphofructokinase-1 (PFK-1), allosterically inhibited by ATP and citrate.

Phase 2: Pyruvate Decarboxylation & The Citric Acid (Krebs) Cycle
Pyruvate is transported into the mitochondrial matrix by pyruvate translocase. The Pyruvate Dehydrogenase Complex (PDC) converts pyruvate into Acetyl-CoA, releasing CO2 and producing 1 NADH per pyruvate. Acetyl-CoA then combines with oxaloacetate (4C) to form citrate (6C). Through one complete turn of the cycle, 3 NADH, 1 FADH2, 1 GTP/ATP, and 2 CO2 molecules are produced. Because one glucose produces two pyruvates, the cycle turns twice per glucose.

Phase 3: Oxidative Phosphorylation & The Electron Transport Chain (ETC)
Located in the mitochondrial inner cristae membrane. High-energy electrons from NADH and FADH2 are transferred through Complexes I, II, III, and IV to molecular oxygen (the terminal electron acceptor), forming H2O. Proton pumping across Complexes I, III, and IV creates a steep electrochemical proton gradient (proton-motive force) in the intermembrane space.
ATP Synthase (Complex V) exploits this chemiosmotic gradient to phosphorylate ADP into ATP via rotary catalysis. Theoretical maximum yield is ~30 to 32 ATP per oxidized glucose molecule.`,
  },
  {
    title: 'Time Complexity & Hash Table Collisions',
    subject: 'Computer Science',
    description: 'Big-O asymptotic analysis, hash functions, load factors, and collision resolution strategies.',
    content: `Hash tables provide average O(1) time complexity for lookup, insertion, and deletion operations by mapping keys to array indices using a deterministic hash function.

Asymptotic Complexity & Worst Cases:
Under ideal conditions with uniform distribution and low load factor (alpha = n/m), lookups execute in O(1) constant amortized time. However, in worst-case pathological collision scenarios, lookup degrades to O(n) linear search, identical to traversing an unsorted linked list.

Collision Resolution Strategies:
1. Separate Chaining: Each bucket holds an independent data structure (e.g., singly linked list, balanced Red-Black tree like Java 8+ HashMap when chain length exceeds 8). Deletions are straightforward, but it incurs cache-locality penalties due to pointer chasing.
2. Open Addressing: All elements reside inside the table array itself. When a collision occurs, probing sequence is executed:
   - Linear Probing: index = (hash(key) + i) % size. Highly cache-friendly but suffers from primary clustering.
   - Quadratic Probing: index = (hash(key) + c1*i + c2*i^2) % size. Eliminates primary clustering but causes secondary clustering.
   - Double Hashing: Uses a secondary hash function: index = (hash1(key) + i * hash2(key)) % size. Minimizes clustering if hash2 is coprime to table size.

Load Factor Management & Resizing:
When the load factor alpha exceeds a critical threshold (typically 0.70 to 0.75), dynamic table doubling occurs: an array with double the capacity is allocated, and all existing entries are re-hashed (an O(n) operation amortized across preceding inserts).`,
  },
  {
    title: 'Monetary Policy & Inflation Dynamics',
    subject: 'Economics',
    description: 'Central bank interest rates, reserve ratios, open market operations, and Phillips curve trade-offs.',
    content: `Central banks utilize monetary policy instruments to achieve dual mandates: price stability (controlling inflation) and sustainable maximum employment.

Core Policy Instruments:
1. Policy Interest Rate (Federal Funds Rate / Repo Rate): The benchmark rate at which commercial banks borrow short-term reserves. Raising rates increases the borrowing cost across mortgages, commercial loans, and credit, dampening aggregate demand (AD).
2. Open Market Operations (OMO): The purchase or sale of government sovereign bonds. Buying bonds injects liquid reserves into banking channels (expansionary), while selling bonds absorbs liquidity (contractionary).
3. Reserve Requirements: The mandatory fraction of customer deposits banks must maintain in liquid central bank reserves. Altering this shifts the money multiplier (1 / reserve ratio).
4. Quantitative Easing (QE) / Quantitative Tightening (QT): Direct large-scale asset purchase programs targeting long-term yields when short-term interest rates approach the Zero Lower Bound (ZLB).

The Inflation-Unemployment Tradeoff:
The short-run Phillips Curve posits an inverse empirical relationship between inflation and unemployment. However, expectations-augmented Phillips Curve models (Milton Friedman, Edmund Phelps) demonstrate that in the long run, unemployment gravitates toward the Natural Rate of Unemployment (NAIRU), meaning monetary expansion without productivity gains merely generates sustained nominal inflation.`,
  },
];

export const INITIAL_SAMPLE_SUMMARIES: SummaryDocument[] = [
  {
    id: 'sum_bio_1',
    title: 'Cellular Respiration & Energy Production',
    subject: 'Biology',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    rawSourceText: SAMPLE_STUDY_PRESETS[0].content,
    estimatedReadTimeMinutes: 3,
    executiveSummary:
      'Cellular respiration converts biochemical energy from nutrients into ATP through three linked stages: anaerobic cytoplasmic glycolysis, the mitochondrial Krebs cycle, and cristae-bound oxidative phosphorylation. The process yields ~30-32 ATP per glucose, fueled primarily by a chemiosmotic proton gradient driving ATP Synthase.',
    coreConcepts: [
      {
        concept: 'Chemiosmosis & Proton-Motive Force',
        explanation: 'Electrons flowing down complexes I-IV pump H+ protons into the intermembrane space, creating electrical and chemical potential.',
        whyItMatters: 'Powers ATP Synthase rotary catalysis; uncoupling proteins dissipate this gradient as heat instead of ATP.',
      },
      {
        concept: 'Substrate-Level vs Oxidative Phosphorylation',
        explanation: 'Substrate-level directly transfers a phosphate from an organic donor (Glycolysis & Krebs); oxidative harnesses the ETC electrochemical gradient.',
        whyItMatters: 'Oxidative phosphorylation produces the overwhelming majority (~90%) of cellular energy.',
      },
      {
        concept: 'Allosteric Regulation via PFK-1',
        explanation: 'Phosphofructokinase-1 controls the committed step in glycolysis; turned off when cellular ATP is plentiful.',
        whyItMatters: 'Prevents wasteful consumption of glucose reserves when metabolic energy needs are satisfied.',
      },
    ],
    keyBulletPoints: [
      'Glycolysis occurs in cytosol, is anaerobic, and nets 2 ATP + 2 NADH per glucose.',
      'Pyruvate must enter mitochondria via pyruvate translocase before conversion to Acetyl-CoA.',
      'Krebs Cycle turns twice per glucose, yielding 6 NADH, 2 FADH2, and 2 GTP/ATP.',
      'Oxygen acts as the terminal electron acceptor at Complex IV, forming metabolic water.',
      'Theoretical total ATP yield is approximately 30 to 32 ATP per glucose molecule.',
    ],
    glossary: [
      { term: 'ATP Synthase', definition: 'A rotary enzyme complex in the inner mitochondrial membrane that synthesizes ATP from ADP and Pi driven by proton flux.' },
      { term: 'Chemiosmosis', definition: 'The movement of ions across a semipermeable membrane down their electrochemical gradient to drive cellular work.' },
      { term: 'PFK-1', definition: 'Phosphofructokinase-1, the primary rate-limiting regulatory enzyme of the glycolytic pathway.' },
      { term: 'Terminal Electron Acceptor', definition: 'The final compound in the electron transport chain (O2 in aerobic respiration) that receives electrons.' },
    ],
    examTips: [
      'Frequent exam trap: Remember that glycolysis yields 4 GROSS ATP, but only 2 NET ATP due to the initial 2 ATP investment phase.',
      'Do not confuse the outer mitochondrial membrane with the inner cristae membrane; proton gradient builds up in the intermembrane space!',
    ],
    tags: ['Mitochondria', 'Biochemistry', 'Metabolism'],
  },
];

export const INITIAL_SAMPLE_DECKS: FlashcardDeck[] = [
  {
    id: 'deck_bio_1',
    title: 'Cellular Respiration Mastery Deck',
    subject: 'Biology',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    sourceSummaryId: 'sum_bio_1',
    description: 'High-yield flashcards testing glycolysis, the Krebs cycle, and electron transport chain mechanisms.',
    cards: [
      {
        id: 'c1',
        question: 'What is the net gain of ATP produced per glucose molecule during glycolysis alone?',
        answer: '2 Net ATP (4 ATP produced minus 2 ATP consumed in the preparatory investment phase).',
        hint: 'Think about the initial investment required to phosphorylate glucose.',
        category: 'Glycolysis',
        difficulty: 'easy',
        mastered: true,
        reviewCount: 3,
      },
      {
        id: 'c2',
        question: 'What role does molecular oxygen (O2) play in the Electron Transport Chain?',
        answer: 'It serves as the terminal electron acceptor at Complex IV, accepting electrons and protons to form water (H2O).',
        hint: 'What molecule receives the electrons at the very end of Complex IV?',
        category: 'Oxidative Phosphorylation',
        difficulty: 'medium',
        mastered: true,
        reviewCount: 2,
      },
      {
        id: 'c3',
        question: 'Which rate-limiting enzyme regulates the committed step of glycolysis and is inhibited by high ATP levels?',
        answer: 'Phosphofructokinase-1 (PFK-1).',
        hint: 'Three letters: P...F...K-1.',
        category: 'Enzymology',
        difficulty: 'medium',
        mastered: false,
        reviewCount: 1,
      },
      {
        id: 'c4',
        question: 'Where specifically does the proton gradient (proton-motive force) accumulate in mitochondria?',
        answer: 'In the mitochondrial intermembrane space (between the outer membrane and the inner cristae membrane).',
        hint: 'It is the space between the two mitochondrial membranes.',
        category: 'Mitochondria Anatomy',
        difficulty: 'hard',
        mastered: false,
        reviewCount: 1,
      },
      {
        id: 'c5',
        question: 'How many turns of the Krebs cycle occur per single molecule of glucose oxidized?',
        answer: 'Two complete turns (because each glucose yields two 3-carbon pyruvate molecules, forming two Acetyl-CoA).',
        hint: 'Count how many pyruvates one 6-carbon glucose splits into.',
        category: 'Krebs Cycle',
        difficulty: 'easy',
        mastered: true,
        reviewCount: 4,
      },
      {
        id: 'c6',
        question: 'What is the difference between substrate-level phosphorylation and oxidative phosphorylation?',
        answer: 'Substrate-level directly couples phosphate transfer from a high-energy metabolic intermediate; oxidative uses the ETC electrochemical proton gradient across ATP Synthase.',
        hint: 'One involves an enzyme intermediate; the other involves a proton turbine gradient.',
        category: 'Bioenergetics',
        difficulty: 'hard',
        mastered: false,
        reviewCount: 2,
      },
    ],
  },
  {
    id: 'deck_cs_1',
    title: 'Data Structures: Hash Tables & Complexity',
    subject: 'Computer Science',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    description: 'Collision resolution algorithms, amortized time complexity, and open addressing probing.',
    cards: [
      {
        id: 'cs1',
        question: 'What is the average vs worst-case time complexity of hash table lookups?',
        answer: 'Average: O(1) constant time. Worst case: O(n) linear time when all keys hash to the same bucket.',
        hint: 'Think about what happens if all keys collide into a single chain.',
        category: 'Complexity',
        difficulty: 'easy',
        mastered: true,
        reviewCount: 2,
      },
      {
        id: 'cs2',
        question: 'How does Linear Probing resolve collisions in Open Addressing, and what is its main flaw?',
        answer: 'It searches sequentially for the next available slot: (hash + i) % size. Flaw: Primary clustering (runs of occupied slots grow longer).',
        hint: 'It checks index+1, index+2... and causes clusters.',
        category: 'Open Addressing',
        difficulty: 'medium',
        mastered: false,
        reviewCount: 1,
      },
      {
        id: 'cs3',
        question: 'What is the load factor (alpha) of a hash table and at what general threshold is resizing triggered?',
        answer: 'Load factor alpha = n / m (items / bucket slots). Resizing is typically triggered around alpha >= 0.70 to 0.75.',
        hint: 'Number of elements divided by table capacity.',
        category: 'System Design',
        difficulty: 'medium',
        mastered: true,
        reviewCount: 3,
      },
      {
        id: 'cs4',
        question: 'Why do modern implementations like Java 8+ convert linked list chains to Red-Black trees?',
        answer: 'To guarantee O(log n) worst-case lookup time instead of O(n) when hash collisions exceed a bucket treeify threshold (usually 8).',
        hint: 'What is the search time of a self-balancing binary search tree?',
        category: 'Separate Chaining',
        difficulty: 'hard',
        mastered: false,
        reviewCount: 1,
      },
    ],
  },
];
