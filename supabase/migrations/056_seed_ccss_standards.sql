-- Migration 056: Seed CCSS anchor standards and skill-to-standard mappings
-- CCSS-01: Executes the data defined in src/lib/intelligence/ccss-seed.ts
-- Idempotent via ON CONFLICT DO NOTHING

INSERT INTO ccss_standards (standard_code, strand, grade, domain, description) VALUES
  -- ELA Reading: Literature
  ('CCSS.ELA-LITERACY.RL.3.1', 'ELA', '3', 'Reading: Literature', 'Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.'),
  ('CCSS.ELA-LITERACY.RL.4.1', 'ELA', '4', 'Reading: Literature', 'Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text.'),
  ('CCSS.ELA-LITERACY.RL.5.1', 'ELA', '5', 'Reading: Literature', 'Quote accurately from a text and explain what the text says explicitly and what is inferred from the text.'),
  ('CCSS.ELA-LITERACY.RL.6.1', 'ELA', '6', 'Reading: Literature', 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.'),
  ('CCSS.ELA-LITERACY.RL.7.1', 'ELA', '7', 'Reading: Literature', 'Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.'),
  ('CCSS.ELA-LITERACY.RL.8.1', 'ELA', '8', 'Reading: Literature', 'Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text.'),
  -- ELA Writing
  ('CCSS.ELA-LITERACY.W.3.1', 'ELA', '3', 'Writing', 'Write opinion pieces on topics or texts, supporting a point of view with reasons.'),
  ('CCSS.ELA-LITERACY.W.4.1', 'ELA', '4', 'Writing', 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information.'),
  ('CCSS.ELA-LITERACY.W.5.1', 'ELA', '5', 'Writing', 'Write opinion pieces on topics or texts, supporting a point of view with logically ordered reasons and information.'),
  ('CCSS.ELA-LITERACY.W.6.1', 'ELA', '6', 'Writing', 'Write arguments to support claims with clear reasons and relevant evidence.'),
  ('CCSS.ELA-LITERACY.W.7.1', 'ELA', '7', 'Writing', 'Write arguments to support claims with clear reasons and relevant evidence, using credible sources.'),
  ('CCSS.ELA-LITERACY.W.8.1', 'ELA', '8', 'Writing', 'Write arguments to support claims with clear reasons and relevant evidence, acknowledging counter-arguments.'),
  -- ELA Speaking & Listening
  ('CCSS.ELA-LITERACY.SL.3.1', 'ELA', '3', 'Speaking & Listening', 'Engage effectively in a range of collaborative discussions with diverse partners.'),
  ('CCSS.ELA-LITERACY.SL.5.1', 'ELA', '5', 'Speaking & Listening', 'Engage effectively in a range of collaborative discussions, building on others'' ideas and expressing your own clearly.'),
  ('CCSS.ELA-LITERACY.SL.6.1', 'ELA', '6', 'Speaking & Listening', 'Engage effectively in a range of collaborative discussions, posing and responding to specific questions.'),
  -- Math Operations & Algebraic Thinking
  ('CCSS.MATH.CONTENT.3.OA.A.1', 'Math', '3', 'Operations & Algebraic Thinking', 'Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each.'),
  ('CCSS.MATH.CONTENT.3.OA.D.8', 'Math', '3', 'Operations & Algebraic Thinking', 'Solve two-step word problems using the four operations. Represent these problems using equations with a letter standing for the unknown quantity.'),
  ('CCSS.MATH.CONTENT.4.OA.A.1', 'Math', '4', 'Operations & Algebraic Thinking', 'Interpret a multiplication equation as a comparison, e.g., interpret 35 = 5 × 7 as a statement that 35 is 5 times as many as 7.'),
  ('CCSS.MATH.CONTENT.5.OA.A.1', 'Math', '5', 'Operations & Algebraic Thinking', 'Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.'),
  -- Math Number & Operations in Base Ten
  ('CCSS.MATH.CONTENT.3.NBT.A.2', 'Math', '3', 'Number & Operations in Base Ten', 'Fluently add and subtract within 1000 using strategies and algorithms based on place value, properties of operations, and the relationship between addition and subtraction.'),
  ('CCSS.MATH.CONTENT.4.NBT.B.4', 'Math', '4', 'Number & Operations in Base Ten', 'Fluently add and subtract multi-digit whole numbers using the standard algorithm.'),
  ('CCSS.MATH.CONTENT.5.NBT.B.5', 'Math', '5', 'Number & Operations in Base Ten', 'Fluently multiply multi-digit whole numbers using the standard algorithm.'),
  -- Math Fractions
  ('CCSS.MATH.CONTENT.3.NF.A.1', 'Math', '3', 'Number & Operations—Fractions', 'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts.'),
  ('CCSS.MATH.CONTENT.4.NF.B.3', 'Math', '4', 'Number & Operations—Fractions', 'Understand a fraction a/b with a > 1 as a sum of fractions 1/b.'),
  ('CCSS.MATH.CONTENT.5.NF.A.1', 'Math', '5', 'Number & Operations—Fractions', 'Add and subtract fractions with unlike denominators.'),
  -- Math Ratios & Proportional Relationships
  ('CCSS.MATH.CONTENT.6.RP.A.1', 'Math', '6', 'Ratios & Proportional Relationships', 'Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.'),
  ('CCSS.MATH.CONTENT.7.RP.A.2', 'Math', '7', 'Ratios & Proportional Relationships', 'Recognize and represent proportional relationships between quantities.'),
  -- Math Expressions & Equations
  ('CCSS.MATH.CONTENT.6.EE.A.1', 'Math', '6', 'Expressions & Equations', 'Write and evaluate numerical expressions involving whole-number exponents.'),
  ('CCSS.MATH.CONTENT.7.EE.B.3', 'Math', '7', 'Expressions & Equations', 'Solve multi-step real-life and mathematical problems posed with positive and negative rational numbers.'),
  ('CCSS.MATH.CONTENT.8.EE.A.1', 'Math', '8', 'Expressions & Equations', 'Know and apply the properties of integer exponents to generate equivalent numerical expressions.'),
  -- Math Functions
  ('CCSS.MATH.CONTENT.8.F.A.1', 'Math', '8', 'Functions', 'Understand that a function is a rule that assigns to each input exactly one output.'),
  ('CCSS.MATH.CONTENT.8.F.B.4', 'Math', '8', 'Functions', 'Construct a function to model a linear relationship between two quantities.'),
  -- Math Statistics & Probability
  ('CCSS.MATH.CONTENT.6.SP.A.1', 'Math', '6', 'Statistics & Probability', 'Recognize a statistical question as one that anticipates variability in the data related to the question.'),
  ('CCSS.MATH.CONTENT.7.SP.A.1', 'Math', '7', 'Statistics & Probability', 'Understand that statistics can be used to gain information about a population by examining a sample of the population.'),
  ('CCSS.MATH.CONTENT.8.SP.A.1', 'Math', '8', 'Statistics & Probability', 'Construct and interpret scatter plots for bivariate measurement data to investigate patterns of association between two quantities.')
ON CONFLICT (standard_code) DO NOTHING;

-- Skill-to-CCSS mappings (from SKILL_TO_CCSS_MAPPINGS in ccss-seed.ts)
INSERT INTO skill_to_ccss_map (skill_code, ccss_standard_code, mapping_strength) VALUES
  ('critical-thinking', 'CCSS.ELA-LITERACY.RL.6.1', 0.9),
  ('critical-thinking', 'CCSS.ELA-LITERACY.RL.7.1', 0.9),
  ('argumentation',    'CCSS.ELA-LITERACY.W.6.1',  0.95),
  ('argumentation',    'CCSS.ELA-LITERACY.W.7.1',  0.95),
  ('argumentation',    'CCSS.ELA-LITERACY.W.8.1',  0.9),
  ('self-regulation',  'CCSS.ELA-LITERACY.SL.6.1', 0.7),
  ('evidence-use',     'CCSS.ELA-LITERACY.RL.5.1', 0.85),
  ('evidence-use',     'CCSS.ELA-LITERACY.RL.6.1', 0.9),
  ('inference',        'CCSS.ELA-LITERACY.RL.4.1', 0.85),
  ('inference',        'CCSS.ELA-LITERACY.RL.5.1', 0.85),
  ('problem-solving',  'CCSS.MATH.CONTENT.3.OA.D.8', 0.9),
  ('problem-solving',  'CCSS.MATH.CONTENT.4.OA.A.1', 0.85),
  ('number-sense',     'CCSS.MATH.CONTENT.3.NBT.A.2', 0.9),
  ('number-sense',     'CCSS.MATH.CONTENT.4.NBT.B.4', 0.85),
  ('fractions',        'CCSS.MATH.CONTENT.3.NF.A.1', 0.95),
  ('fractions',        'CCSS.MATH.CONTENT.4.NF.B.3', 0.95),
  ('fractions',        'CCSS.MATH.CONTENT.5.NF.A.1', 0.95),
  ('ratios',           'CCSS.MATH.CONTENT.6.RP.A.1', 0.95),
  ('ratios',           'CCSS.MATH.CONTENT.7.RP.A.2', 0.95),
  ('algebra',          'CCSS.MATH.CONTENT.6.EE.A.1', 0.9),
  ('algebra',          'CCSS.MATH.CONTENT.7.EE.B.3', 0.9),
  ('functions',        'CCSS.MATH.CONTENT.8.F.A.1',  0.95),
  ('data-analysis',    'CCSS.MATH.CONTENT.6.SP.A.1', 0.9),
  ('data-analysis',    'CCSS.MATH.CONTENT.7.SP.A.1', 0.9)
ON CONFLICT (skill_code, ccss_standard_code) DO NOTHING;
