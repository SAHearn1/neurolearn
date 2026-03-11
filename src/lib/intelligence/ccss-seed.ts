// CCSS-01: Common Core Standards seed data
// Representative subset of ~40 anchor standards for ELA and Math (grades 3-8)

export interface CcssStandard {
  standard_code: string
  strand: 'ELA' | 'Math'
  grade: string
  domain: string
  description: string
  anchor_standard?: string
}

export const CCSS_ANCHOR_STANDARDS: CcssStandard[] = [
  // ELA Reading: Literature (grades 3-8)
  {
    standard_code: 'CCSS.ELA-LITERACY.RL.3.1',
    strand: 'ELA',
    grade: '3',
    domain: 'Reading: Literature',
    description:
      'Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.RL.4.1',
    strand: 'ELA',
    grade: '4',
    domain: 'Reading: Literature',
    description:
      'Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.RL.5.1',
    strand: 'ELA',
    grade: '5',
    domain: 'Reading: Literature',
    description:
      'Quote accurately from a text and explain what the text says explicitly and what is inferred from the text.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.RL.6.1',
    strand: 'ELA',
    grade: '6',
    domain: 'Reading: Literature',
    description:
      'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.RL.7.1',
    strand: 'ELA',
    grade: '7',
    domain: 'Reading: Literature',
    description:
      'Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.RL.8.1',
    strand: 'ELA',
    grade: '8',
    domain: 'Reading: Literature',
    description:
      'Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text.',
  },
  // ELA Writing
  {
    standard_code: 'CCSS.ELA-LITERACY.W.3.1',
    strand: 'ELA',
    grade: '3',
    domain: 'Writing',
    description:
      'Write opinion pieces on topics or texts, supporting a point of view with reasons.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.W.4.1',
    strand: 'ELA',
    grade: '4',
    domain: 'Writing',
    description:
      'Write opinion pieces on topics or texts, supporting a point of view with reasons and information.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.W.5.1',
    strand: 'ELA',
    grade: '5',
    domain: 'Writing',
    description:
      'Write opinion pieces on topics or texts, supporting a point of view with logically ordered reasons and information.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.W.6.1',
    strand: 'ELA',
    grade: '6',
    domain: 'Writing',
    description: 'Write arguments to support claims with clear reasons and relevant evidence.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.W.7.1',
    strand: 'ELA',
    grade: '7',
    domain: 'Writing',
    description:
      'Write arguments to support claims with clear reasons and relevant evidence, using credible sources.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.W.8.1',
    strand: 'ELA',
    grade: '8',
    domain: 'Writing',
    description:
      'Write arguments to support claims with clear reasons and relevant evidence, acknowledging counter-arguments.',
  },
  // ELA Speaking & Listening
  {
    standard_code: 'CCSS.ELA-LITERACY.SL.3.1',
    strand: 'ELA',
    grade: '3',
    domain: 'Speaking & Listening',
    description:
      'Engage effectively in a range of collaborative discussions with diverse partners.',
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.SL.5.1',
    strand: 'ELA',
    grade: '5',
    domain: 'Speaking & Listening',
    description:
      "Engage effectively in a range of collaborative discussions, building on others' ideas and expressing your own clearly.",
  },
  {
    standard_code: 'CCSS.ELA-LITERACY.SL.6.1',
    strand: 'ELA',
    grade: '6',
    domain: 'Speaking & Listening',
    description:
      'Engage effectively in a range of collaborative discussions, posing and responding to specific questions.',
  },
  // Math Operations & Algebraic Thinking
  {
    standard_code: 'CCSS.MATH.CONTENT.3.OA.A.1',
    strand: 'Math',
    grade: '3',
    domain: 'Operations & Algebraic Thinking',
    description:
      'Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.3.OA.D.8',
    strand: 'Math',
    grade: '3',
    domain: 'Operations & Algebraic Thinking',
    description:
      'Solve two-step word problems using the four operations. Represent these problems using equations with a letter standing for the unknown quantity.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.4.OA.A.1',
    strand: 'Math',
    grade: '4',
    domain: 'Operations & Algebraic Thinking',
    description:
      'Interpret a multiplication equation as a comparison, e.g., interpret 35 = 5 × 7 as a statement that 35 is 5 times as many as 7.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.5.OA.A.1',
    strand: 'Math',
    grade: '5',
    domain: 'Operations & Algebraic Thinking',
    description:
      'Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.',
  },
  // Math Number & Operations in Base Ten
  {
    standard_code: 'CCSS.MATH.CONTENT.3.NBT.A.2',
    strand: 'Math',
    grade: '3',
    domain: 'Number & Operations in Base Ten',
    description:
      'Fluently add and subtract within 1000 using strategies and algorithms based on place value, properties of operations, and the relationship between addition and subtraction.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.4.NBT.B.4',
    strand: 'Math',
    grade: '4',
    domain: 'Number & Operations in Base Ten',
    description:
      'Fluently add and subtract multi-digit whole numbers using the standard algorithm.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.5.NBT.B.5',
    strand: 'Math',
    grade: '5',
    domain: 'Number & Operations in Base Ten',
    description: 'Fluently multiply multi-digit whole numbers using the standard algorithm.',
  },
  // Math Fractions
  {
    standard_code: 'CCSS.MATH.CONTENT.3.NF.A.1',
    strand: 'Math',
    grade: '3',
    domain: 'Number & Operations—Fractions',
    description:
      'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.4.NF.B.3',
    strand: 'Math',
    grade: '4',
    domain: 'Number & Operations—Fractions',
    description: 'Understand a fraction a/b with a > 1 as a sum of fractions 1/b.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.5.NF.A.1',
    strand: 'Math',
    grade: '5',
    domain: 'Number & Operations—Fractions',
    description: 'Add and subtract fractions with unlike denominators.',
  },
  // Math Ratios & Proportional Relationships (6-8)
  {
    standard_code: 'CCSS.MATH.CONTENT.6.RP.A.1',
    strand: 'Math',
    grade: '6',
    domain: 'Ratios & Proportional Relationships',
    description:
      'Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.7.RP.A.2',
    strand: 'Math',
    grade: '7',
    domain: 'Ratios & Proportional Relationships',
    description: 'Recognize and represent proportional relationships between quantities.',
  },
  // Math Expressions & Equations
  {
    standard_code: 'CCSS.MATH.CONTENT.6.EE.A.1',
    strand: 'Math',
    grade: '6',
    domain: 'Expressions & Equations',
    description: 'Write and evaluate numerical expressions involving whole-number exponents.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.7.EE.B.3',
    strand: 'Math',
    grade: '7',
    domain: 'Expressions & Equations',
    description:
      'Solve multi-step real-life and mathematical problems posed with positive and negative rational numbers.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.8.EE.A.1',
    strand: 'Math',
    grade: '8',
    domain: 'Expressions & Equations',
    description:
      'Know and apply the properties of integer exponents to generate equivalent numerical expressions.',
  },
  // Math Functions
  {
    standard_code: 'CCSS.MATH.CONTENT.8.F.A.1',
    strand: 'Math',
    grade: '8',
    domain: 'Functions',
    description:
      'Understand that a function is a rule that assigns to each input exactly one output.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.8.F.B.4',
    strand: 'Math',
    grade: '8',
    domain: 'Functions',
    description: 'Construct a function to model a linear relationship between two quantities.',
  },
  // Math Statistics & Probability
  {
    standard_code: 'CCSS.MATH.CONTENT.6.SP.A.1',
    strand: 'Math',
    grade: '6',
    domain: 'Statistics & Probability',
    description:
      'Recognize a statistical question as one that anticipates variability in the data related to the question.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.7.SP.A.1',
    strand: 'Math',
    grade: '7',
    domain: 'Statistics & Probability',
    description:
      'Understand that statistics can be used to gain information about a population by examining a sample of the population.',
  },
  {
    standard_code: 'CCSS.MATH.CONTENT.8.SP.A.1',
    strand: 'Math',
    grade: '8',
    domain: 'Statistics & Probability',
    description:
      'Construct and interpret scatter plots for bivariate measurement data to investigate patterns of association between two quantities.',
  },
]

// Skill-to-CCSS mappings for common skill codes
export const SKILL_TO_CCSS_MAPPINGS: Array<{
  skill_code: string
  ccss_standard_code: string
  mapping_strength: number
}> = [
  {
    skill_code: 'critical-thinking',
    ccss_standard_code: 'CCSS.ELA-LITERACY.RL.6.1',
    mapping_strength: 0.9,
  },
  {
    skill_code: 'critical-thinking',
    ccss_standard_code: 'CCSS.ELA-LITERACY.RL.7.1',
    mapping_strength: 0.9,
  },
  {
    skill_code: 'argumentation',
    ccss_standard_code: 'CCSS.ELA-LITERACY.W.6.1',
    mapping_strength: 0.95,
  },
  {
    skill_code: 'argumentation',
    ccss_standard_code: 'CCSS.ELA-LITERACY.W.7.1',
    mapping_strength: 0.95,
  },
  {
    skill_code: 'argumentation',
    ccss_standard_code: 'CCSS.ELA-LITERACY.W.8.1',
    mapping_strength: 0.9,
  },
  {
    skill_code: 'self-regulation',
    ccss_standard_code: 'CCSS.ELA-LITERACY.SL.6.1',
    mapping_strength: 0.7,
  },
  {
    skill_code: 'evidence-use',
    ccss_standard_code: 'CCSS.ELA-LITERACY.RL.5.1',
    mapping_strength: 0.85,
  },
  {
    skill_code: 'evidence-use',
    ccss_standard_code: 'CCSS.ELA-LITERACY.RL.6.1',
    mapping_strength: 0.9,
  },
  {
    skill_code: 'inference',
    ccss_standard_code: 'CCSS.ELA-LITERACY.RL.4.1',
    mapping_strength: 0.85,
  },
  {
    skill_code: 'inference',
    ccss_standard_code: 'CCSS.ELA-LITERACY.RL.5.1',
    mapping_strength: 0.85,
  },
  {
    skill_code: 'problem-solving',
    ccss_standard_code: 'CCSS.MATH.CONTENT.3.OA.D.8',
    mapping_strength: 0.9,
  },
  {
    skill_code: 'problem-solving',
    ccss_standard_code: 'CCSS.MATH.CONTENT.4.OA.A.1',
    mapping_strength: 0.85,
  },
  {
    skill_code: 'number-sense',
    ccss_standard_code: 'CCSS.MATH.CONTENT.3.NBT.A.2',
    mapping_strength: 0.9,
  },
  {
    skill_code: 'number-sense',
    ccss_standard_code: 'CCSS.MATH.CONTENT.4.NBT.B.4',
    mapping_strength: 0.85,
  },
  {
    skill_code: 'fractions',
    ccss_standard_code: 'CCSS.MATH.CONTENT.3.NF.A.1',
    mapping_strength: 0.95,
  },
  {
    skill_code: 'fractions',
    ccss_standard_code: 'CCSS.MATH.CONTENT.4.NF.B.3',
    mapping_strength: 0.95,
  },
  {
    skill_code: 'fractions',
    ccss_standard_code: 'CCSS.MATH.CONTENT.5.NF.A.1',
    mapping_strength: 0.95,
  },
  {
    skill_code: 'ratios',
    ccss_standard_code: 'CCSS.MATH.CONTENT.6.RP.A.1',
    mapping_strength: 0.95,
  },
  {
    skill_code: 'ratios',
    ccss_standard_code: 'CCSS.MATH.CONTENT.7.RP.A.2',
    mapping_strength: 0.95,
  },
  {
    skill_code: 'algebra',
    ccss_standard_code: 'CCSS.MATH.CONTENT.6.EE.A.1',
    mapping_strength: 0.9,
  },
  {
    skill_code: 'algebra',
    ccss_standard_code: 'CCSS.MATH.CONTENT.7.EE.B.3',
    mapping_strength: 0.9,
  },
  {
    skill_code: 'functions',
    ccss_standard_code: 'CCSS.MATH.CONTENT.8.F.A.1',
    mapping_strength: 0.95,
  },
  {
    skill_code: 'data-analysis',
    ccss_standard_code: 'CCSS.MATH.CONTENT.6.SP.A.1',
    mapping_strength: 0.9,
  },
  {
    skill_code: 'data-analysis',
    ccss_standard_code: 'CCSS.MATH.CONTENT.7.SP.A.1',
    mapping_strength: 0.9,
  },
]
