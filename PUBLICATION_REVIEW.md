# Publication explanations — review copy

Edit `publication-summaries.json`, then run `python3 scripts/build.py` to regenerate this file and the website.

These are short explanatory overviews based on available abstracts or paper excerpts, not full-text peer reviews. All remain drafts for the owner to check. Source gaps and related-version matches are explicitly noted below.

## 2026

### Rethinking Failure Attribution in Multi-Agent Systems: A Multi-Perspective Benchmark and Evaluation

When several AI agents fail together, there may be more than one reasonable explanation. MP-Bench evaluates failure diagnosis from multiple perspectives, so debugging is not judged against a single assumed root cause.

- ID: `pub-0dbf34d862a6`
- Source: https://arxiv.org/html/2603.25001v1
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Charts Are Not Images: On the Challenges of Scientific Chart Editing

A chart edit must preserve the meaning of its data, not just look convincing. FigEdit tests changes to scientific charts and shows why image-editing models and pixel-based scores can miss structurally incorrect results.

- ID: `pub-ac571d66ec56`
- Source: https://arxiv.org/html/2512.00752v1
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Reasoning-Based Personalized Generation for Users with Sparse Data

How can an AI personalize text for someone with very little history? GraSPeR predicts likely user–item connections, generates supporting synthetic context, and combines it with real history to guide personalized responses.

- ID: `pub-ad7f85363364`
- Source: https://arxiv.org/html/2602.21219v1
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Multi-Agent Collaborative Filtering: Orchestrating Users and Items for Agentic Recommendations

MACF turns similar users and relevant items into collaborating AI agents. An orchestrator manages their discussion and recruits useful participants, bringing collaborative filtering signals into an agent-based recommender.

- ID: `pub-28ea3525df7b`
- Source: https://arxiv.org/html/2511.18413v2
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### A Survey on LLM-based Conversational User Simulation

A guide to using language models as simulated conversational users. The survey organizes who is simulated, what behavior is modeled, and how simulators are built and evaluated, with open questions about realistic and reliable simulation.

- ID: `pub-aeebd1a0948d`
- Source: https://aclanthology.org/2026.eacl-long.200/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### VipAct: Visual-Perception Enhancement via Specialized VLM Agent Collaboration and Tool-use

VipAct helps a vision-language model inspect details it might otherwise miss. A coordinating agent works with specialist agents and visual tools, combining their evidence to answer questions that require precise visual understanding.

- ID: `pub-705abf4a1095`
- Source: https://ojs.aaai.org/index.php/AAAI/article/view/40976
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2025

### SAND: Boosting LLM Agents with Self-Taught Action Deliberation

SAND teaches an AI agent to compare possible actions before choosing one. It creates its own deliberation examples using sampled actions and feedback from execution, then learns from those examples through repeated fine-tuning.

- ID: `pub-06b3b1840ce3`
- Source: https://aclanthology.org/2025.emnlp-main.152/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Disambiguation in Conversational Question Answering in the Era of LLMs and Agents: A Survey

People often ask questions with several possible meanings. This survey explains how conversational systems detect ambiguity, rewrite questions, cover multiple interpretations, or ask for clarification, and how these choices are evaluated.

- ID: `pub-1462975a8e36`
- Source: https://aclanthology.org/2025.emnlp-main.482/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Mitigating Visual Knowledge Forgetting in MLLM Instruction-tuning via Modality-decoupled Gradient Descent

Teaching a multimodal model new instructions can weaken visual knowledge it already learned. This work separates parts of the training update to preserve rich visual representations while still adapting to the new task.

- ID: `pub-8189af219cc9`
- Source: https://arxiv.org/abs/2502.11740
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Is Safety Standard Same for Everyone? User-Specific Safety Evaluation of Large Language Models

A response that is safe for one user may be inappropriate for another. U-SAFEBENCH tests whether language models account for individual user profiles, and examines a reasoning-based way to improve that behavior.

- ID: `pub-10e2df0bd488`
- Source: https://aclanthology.org/2025.findings-emnlp.353/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### LaMP-Cap: Personalized Figure Caption Generation With Multimodal Figure Profiles

LaMP-Cap studies captions that match an author's style and context. Its dataset provides related figures, captions, and surrounding text as a multimodal profile, letting a model use more than a generic captioning prompt.

- ID: `pub-ec97bc4e1de2`
- Source: https://aclanthology.org/2025.findings-emnlp.521/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Augment before You Try: Knowledge-Enhanced Table Question Answering via Table Expansion

A table may not contain everything needed to answer a question. This approach puts missing external knowledge into an additional table, then queries the original and added tables together with SQL.

- ID: `pub-221b15569ee7`
- Source: https://arxiv.org/abs/2401.15555
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Traceable and Explainable Multimodal Large Language Models: An Information-Theoretic View

This work studies how text instructions change the visual information inside a multimodal model. Information-theoretic measurements and an interpretable concept space help trace those changes across model layers.

- ID: `pub-6b405ee613be`
- Source: https://openreview.net/forum?id=pQm66IPmeE
- Basis: `paper_excerpt` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Doc-React: Multi-page Heterogeneous Document Question-answering

Doc-React answers questions that span text and figures across several document pages. It repeatedly refines what to retrieve using feedback, seeking useful evidence while reducing uncertainty instead of relying on one retrieval pass.

- ID: `pub-ec9d49e34fdb`
- Source: https://aclanthology.org/2025.acl-short.6/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### From Selection to Generation: A Survey of LLM-based Active Learning

Active learning seeks useful training data with less labeling effort. This survey examines how language models can select examples, supply annotations, and generate new examples, and how those roles change the learning loop.

- ID: `pub-10567486bc13`
- Source: https://aclanthology.org/2025.acl-long.708/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Click, Type, Repeat: A Comprehensive Survey on GUI Agents

A survey of AI agents that operate computers by clicking, typing, and reading screens. It organizes their perception, reasoning, planning, and action components, alongside training methods, benchmarks, and unresolved challenges.

- ID: `pub-a68b8da68e42`
- Source: https://openreview.net/pdf?id=ccYWyKCQUu
- Basis: `paper_excerpt` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: ACL acceptance list uses this title; the reviewed PDF is an anonymous submission. Check the final publication title, GUI Agents: A Survey.

### Knowledge-Aware Query Expansion with Large Language Models for Textual and Relational Retrieval

A search request can specify both meaning and relationships, such as product compatibility. This method uses a knowledge graph to expand queries with relational context as well as text, helping retrieval respect those structured requirements.

- ID: `pub-9f672dbbf452`
- Source: https://aclanthology.org/2025.naacl-long.216/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Diversify-verify-adapt: Efficient and Robust Retrieval-Augmented Ambiguous Question Answering

An ambiguous question can need evidence for several interpretations. DIVA broadens the retrieved material, checks its quality, and adjusts the answering strategy, balancing answer coverage with the cost of repeated retrieval.

- ID: `pub-71d054243fa5`
- Source: https://arxiv.org/abs/2409.02361
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Self-Debiasing Large Language Models: Zero-Shot Recognition and Reduction of Stereotypes

Can a language model reduce its own stereotyping without retraining? This work tests simple explanation and reprompting strategies, using the model's existing capabilities to recognize and revise biased responses.

- ID: `pub-ed9039220605`
- Source: https://aclanthology.org/2025.naacl-short.74/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Interactive Visualization Recommendation with Hier-SUCB

Different people want different charts, and their preferences can change during analysis. Hier-SUCB learns from interactive feedback to recommend visualizations while balancing familiar choices with exploration of new ones.

- ID: `pub-23ee6604672f`
- Source: https://doi.org/10.1145/3696410.3714697
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Personalizing Data Delivery: Investigating User Characteristics and Enhancing LLM Predictions

Would you rather see a chart, a table, or a written answer? This user study investigates those preferences and tests how well language models predict them, including when examples of a user's past choices are available.

- ID: `pub-f26c59e15778`
- Source: https://doi.org/10.1145/3701716.3715452
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Evaluation-Free Time-Series Forecasting Model Selection via Meta-Learning

Choosing a forecasting model should not require training every candidate on each new dataset. AutoForecast learns from past forecasting tasks to recommend a suitable model quickly, using both dataset similarity and previous performance patterns.

- ID: `pub-f8c259fb8375`
- Source: https://doi.org/10.1145/3715149
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Probabilistic Hypergraph Recurrent Neural Networks for Time-series Forecasting

Many time series interact in groups rather than just pairs. PHRNN models these group relationships with a probabilistic hypergraph, allowing connections to vary instead of treating them as permanently fixed.

- ID: `pub-489c6625ef19`
- Source: https://doi.org/10.1145/3690624.3709202
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### A Quantitative Metric Selection Approach for Time-series Forecasting Foundation Models

The metric used to compare forecasting models can change which model wins. This work characterizes properties such as sensitivity to large values and outliers, helping analysts choose a metric that fits their priorities.

- ID: `pub-c653149618ef`
- Source: https://doi.org/10.1109/icassp49660.2025.10887984
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Multi-LLM Collaborative Caption Generation in Scientific Documents

Several language models divide the work of writing scientific figure captions: checking training examples, proposing different captions, and selecting and refining a candidate. The goal is to combine visual and textual evidence into more informative descriptions.

- ID: `pub-afcd1278a3fb`
- Source: https://arxiv.org/abs/2501.02552
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Understanding How Paper Writers Use AI-Generated Captions in Figure Caption Writing

How do researchers actually use AI-written captions? In a study of authors revising figures from their own papers, participants often copied and refined suggestions, while complex figures exposed limitations and opportunities for better writing tools.

- ID: `pub-c366c5b6b3d5`
- Source: https://arxiv.org/abs/2501.06317
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2024

### Are Large Language Models Capable of Causal Reasoning for Sensing Data Analysis?

Can language models reason about causes rather than just correlations in sensor data? This paper examines that question using environmental measurements and socioeconomic factors, where intertwined variables can make simple comparisons misleading.

- ID: `pub-a677d3faef19`
- Source: https://doi.org/10.1145/3662006.3662064
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Hallucination Diversity-Aware Active Learning for Text Summarization

Not all hallucinations have the same cause or form. HADAS selects a diverse set of factual errors for human annotation, helping fine-tuning reduce hallucinations in summaries with a smaller labeling budget.

- ID: `pub-302a30d2a763`
- Source: https://aclanthology.org/2024.naacl-long.479/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### DeCoT: Debiasing Chain-of-Thought for Knowledge-Intensive Tasks in Large Language Models via Causal Intervention

Adding facts to a prompt does not guarantee sound reasoning. DeCoT uses a causal framework to reduce misleading associations in chain-of-thought reasoning, helping a model make better use of relevant external knowledge.

- ID: `pub-b55f237667e9`
- Source: https://aclanthology.org/2024.acl-long.758/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Editing Partially Observable Networks via Graph Diffusion Models

Real networks often contain missing or incorrect connections. SGDM uses diffusion over subgraphs to remove unwanted structure, fill in missing regions, or reshape part of a network while conditioning on the observed graph.

- ID: `pub-a61b596cb4e2`
- Source: https://proceedings.mlr.press/v235/trivedi24a.html
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Bias and Fairness in Large Language Models: A Survey

An organized guide to social bias in language models. It distinguishes types of harm, ways to measure bias, datasets used for evaluation, and interventions at different stages of the modeling pipeline.

- ID: `pub-89618dbca564`
- Source: https://doi.org/10.1162/coli_a_00524
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### SciCapenter: Supporting Caption Composition for Scientific Figures with Machine-Generated Captions and Ratings

SciCapenter is an interactive assistant for writing scientific figure captions. It proposes captions, scores their quality, and offers a checklist, letting authors edit and reassess their writing in an iterative workflow.

- ID: `pub-647ce6a67720`
- Source: https://doi.org/10.1145/3613905.3650738
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Fairness-Aware Graph Neural Networks: A Survey

Graph neural networks can inherit or amplify unfairness through data and neighborhood aggregation. This survey organizes fairness measures, benchmark datasets, and mitigation methods used before, during, and after training.

- ID: `pub-59ff64634279`
- Source: https://doi.org/10.1145/3649142
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Evolving Super Graph Neural Networks for Large-scale Time-Series Forecasting

Forecasting thousands of related time series can make a graph model expensive. ESGNN groups strongly related series into super-nodes and updates their connections efficiently, trading a small amount of predictive accuracy for substantial computational savings.

- ID: `pub-2d43d9b3c8b5`
- Source: https://research.adobe.com/publication/evolving-super-graph-neural-networks-for-large-scale-time-series-forecasting/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Which LLM to Play? Convergence-Aware Online Model Selection with Time-Increasing Bandits

Which language model deserves more training or more requests? This work studies online model selection when models improve and then level off, so decisions can account for learning progress as well as the cost of exploration.

- ID: `pub-33468e0596e3`
- Source: https://doi.org/10.1145/3589334.3645420
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2023

### Content-aware Progressive Image Compression and Syncing

When people edit an image together, useful details should arrive quickly. This compression method prioritizes pixels using information content and sends them progressively, aiming to make image synchronization more helpful under limited bandwidth.

- ID: `pub-e7de5d9c1329`
- Source: https://doi.org/10.1109/ism59092.2023.00041
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### GPT-4 as an Effective Zero-Shot Evaluator for Scientific Figure Captions

This paper tests GPT-4 as a judge of scientific figure captions without requiring a reference caption. It compares model scores with human judgments, studying whether this can reduce the cost of evaluating captioning systems.

- ID: `pub-6c996a5d40d7`
- Source: https://aclanthology.org/2023.findings-emnlp.363/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Hypergraph Neural Networks for Time-series Forecasting

A group of machines or sensors may influence one another jointly. HGRNN uses hypergraphs to capture these group interactions and combines them with temporal modeling to forecast several related time series.

- ID: `pub-3e542a64f740`
- Source: https://doi.org/10.1109/bigdata59044.2023.10386109
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Interpretable Unsupervised Log Anomaly Detection

Finding an unusual system log is more useful when the reason is visible. Grid Transformer learns from automatically generated labels to detect anomalies and provide explanations tied to particular messages and time steps.

- ID: `pub-35a840c4087c`
- Source: https://doi.org/10.1109/bigdata59044.2023.10386852
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Summaries as Captions: Generating Figure Captions for Scientific Documents with Automated Text Summarization

A paper's discussion of a figure can be a strong source for its caption. This work summarizes figure-referencing paragraphs into captions and studies challenges such as weak reference captions and unclear evaluation standards.

- ID: `pub-ee2684865a03`
- Source: https://aclanthology.org/2023.inlg-main.6/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### User-Regulation Deconfounded Conversational Recommender System with Bandit Feedback

Conversational recommenders learn preferences by asking about attributes, but a popular attribute can bias item choices. This work studies that confounding effect and develops a user-regulated recommendation approach using bandit feedback.

- ID: `pub-a8ef897103f0`
- Source: https://doi.org/10.1145/3580305.3599539
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Federated Domain Adaptation for Named Entity Recognition via Distilling with Heterogeneous Tag Sets

Organizations may label different entity types and be unable to share their raw text. This work combines federated learning, knowledge distillation, and example weighting to transfer named-entity recognition across domains and mismatched label sets.

- ID: `pub-8d14687eec6e`
- Source: https://aclanthology.org/2023.findings-acl.470/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Direct Embedding of Temporal Network Edges via Time-Decayed Line Graphs

Rather than represent an interaction indirectly through its endpoints, this method embeds the interaction itself. It turns timestamped edges into nodes of a time-weighted line graph, retaining precise timing for prediction and classification.

- ID: `pub-e70a77c27357`
- Source: https://arxiv.org/abs/2210.00032
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2022

### AutoForecast: Automatic Time-Series Forecasting Model Selection

AutoForecast learns which forecasting models work well on earlier datasets and time horizons. It uses that experience to select a model for a new time series without first running every candidate on the new task.

- ID: `pub-92fbd230b468`
- Source: https://doi.org/10.1145/3511808.3557241
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Implicit Session Contexts for Next-Item Recommendations

A browsing session has an underlying intent that may never be explicitly labeled. This method discovers session contexts from a graph, predicts those contexts, and uses them to improve recommendations of the next item.

- ID: `pub-6040dc96ea5a`
- Source: https://doi.org/10.1145/3511808.3557613
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### AutoMARS: Searching to Compress Multi-Modality Recommendation Systems

Recommendations can use images, text, and interaction history, but processing everything is expensive. AutoMARS searches for a compressed architecture and distills knowledge while allocating different resource budgets to the different input types.

- ID: `pub-3752ffaccd00`
- Source: https://doi.org/10.1145/3511808.3557242
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Bundle MCR: Towards Conversational Bundle Recommendation

Recommending a set of items, such as an outfit, is harder than choosing one item. Bundle MCR explores multi-round conversation to learn preferences and narrow down promising bundles when past interaction data is sparse.

- ID: `pub-d941f1815c54`
- Source: https://doi.org/10.1145/3523227.3546755
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Graph Deep Factors for Probabilistic Time-series Forecasting

GraphDF forecasts related time series using both shared patterns and local relationships. Its probabilistic model represents uncertainty, and the journal study also explores incremental learning as new observations arrive.

- ID: `pub-033f7d04b984`
- Source: https://doi.org/10.1145/3543511
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### External Knowledge Infusion for Tabular Pre-training Models with Dual-adapters

Table models can miss the meaning of entities among numbers and strings. This method adds external knowledge through two small adapters—one for knowledge and one for alignment with tables—then combines their contributions.

- ID: `pub-2c326621080a`
- Source: https://doi.org/10.1145/3534678.3539403
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Few-Shot Class-Incremental Learning for Named Entity Recognition

A named-entity recognizer should learn new entity types from a few examples without forgetting old ones. This method reconstructs synthetic examples of earlier classes and combines them with knowledge distillation during learning.

- ID: `pub-84e75241f479`
- Source: https://aclanthology.org/2022.acl-long.43/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Personalized Visualization Recommendation

A useful chart recommendation depends on the person as well as the dataset. This framework learns from past visualization interactions and choices across users and datasets to make more personalized suggestions.

- ID: `pub-9da468e09861`
- Source: https://doi.org/10.1145/3538703
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### On Generalizing Static Node Embedding to Dynamic Settings

Can a static graph embedding method handle a changing network? This framework adds temporal representations and compares ways to preserve time dependencies, including grouping events by a fixed number of edges rather than a fixed time window.

- ID: `pub-3e7ed038c9df`
- Source: https://doi.org/10.1145/3488560.3498428
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### CGC: Contrastive Graph Clustering for Community Detection and Tracking

CGC learns node representations and community assignments together through contrastive learning. It also tracks communities in changing graphs incrementally, allowing the system to detect changes as new interactions arrive.

- ID: `pub-a4ba5fd15d1d`
- Source: https://doi.org/10.1145/3485447.3512160
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### VisGNN: Personalized Visualization Recommendation via Graph Neural Networks

VisGNN represents users, data attributes, and visualization designs in a heterogeneous graph. It learns their relationships to recommend charts that fit a particular user's data interests and design preferences.

- ID: `pub-bf904c11e42a`
- Source: https://doi.org/10.1145/3485447.3512001
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2021

### Influence-guided Data Augmentation for Neural Tensor Completion

Sparse multidimensional data makes missing-value prediction difficult. DAIN estimates which observed entries most influence a neural model, then uses that information to generate targeted training examples for tensor completion.

- ID: `pub-b2f84eb8b584`
- Source: https://doi.org/10.1145/3459637.3482267
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### From Closing Triangles to Higher-Order Motif Closures for Better Unsupervised Online Link Prediction

Predicting a new connection need not rely only on shared neighbors. This work scores links by the larger network patterns they would complete, providing fast, training-free alternatives to triangle-based link prediction.

- ID: `pub-565aaabaa4de`
- Source: https://doi.org/10.1145/3459637.3481920
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### EXACTA: Explainable Column Annotation

Why was a table column assigned a particular label? EXACTA follows reasoning paths through a knowledge graph, producing both an annotation and an inspectable explanation that a data steward can check.

- ID: `pub-5e55e235802f`
- Source: https://doi.org/10.1145/3447548.3467211
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Learning to Recommend Visualizations from Data

Instead of relying entirely on hand-written chart rules, this system learns from datasets and their visualizations. For a new dataset, it generates candidate charts, scores them, and recommends a ranked set for exploration.

- ID: `pub-64745e2ff70b`
- Source: https://doi.org/10.1145/3447548.3467224
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Graph Deep Factor Model for Cloud Utilization Forecasting

GraphDF forecasts cloud resource usage by combining shared patterns with relationships between individual machines' time series. Its probabilistic forecasts can support workload scheduling that makes better use of available cluster capacity.

- ID: `pub-e0ad030f027a`
- Source: https://sanghani.cs.vt.edu/research/publications/2021/graph-deep-factors-for-forecasting-with-applications-to-cloud-resource-allocation.html
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: Homepage uses an earlier title. Published KDD 2021 title: Graph Deep Factors for Forecasting with Applications to Cloud Resource Allocation (10.1145/3447548.3467357).

### EDGE: Enriching Knowledge Graph Embeddings with External Text

EDGE supplements a sparse knowledge graph with information from external text. It aligns the original and expanded graphs in a shared representation, aiming to retain useful knowledge while suppressing noise introduced by augmentation.

- ID: `pub-cb543fc81e56`
- Source: https://aclanthology.org/2021.naacl-main.221/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Learning Contextualized Knowledge Structures for Commonsense Reasoning

Commonsense knowledge graphs are incomplete and contain irrelevant facts. Hybrid Graph Network combines retrieved knowledge with generated missing connections, then filters and reasons over the combined graph in the context of a question.

- ID: `pub-a8a8c71bd58c`
- Source: https://doi.org/10.18653/v1/2021.findings-acl.354
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: Potential duplicate/version pair with the 2020 preprint entry below; retained both source records.

### Generating Accurate Caption Units For Figure Captioning

Accurate short statements can be building blocks for a good chart caption. FigJAM generates controlled types of caption units for bar charts using chart metadata, with the aim of composing more reliable descriptions.

- ID: `pub-898bc68413f8`
- Source: https://doi.org/10.1145/3442381.3449923
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Learning to Deceive Knowledge Graph Augmented Models via Targeted Perturbation

A knowledge-enhanced model may appear to use a graph without relying on its meaning as expected. This study changes graph structure and semantics while preserving task performance, probing the reliability of the resulting explanations.

- ID: `pub-1ab1aaed57b2`
- Source: https://arxiv.org/pdf/2010.12872
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2020

### Learning Contextualized knowledge Structures for Commonsense Reasoning

Hybrid Graph Network fills gaps in retrieved commonsense knowledge with generated connections. It reasons over the combined graph while filtering irrelevant edges, so answers can use knowledge that was absent from the original subgraph.

- ID: `pub-8f3b76ccf7bb`
- Source: https://doi.org/10.18653/v1/2021.findings-acl.354
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: 2020 preprint / 2021 publication pair. Overview checked against the journal/conference abstract; retain or merge after owner review.

### On Proximity and Structural Role-based Embeddings in Networks: Misconceptions, Techniques, and Applications

Nearby nodes and nodes with similar structural roles are different kinds of similarity. This paper clarifies that distinction, explains which embedding mechanisms capture each kind, and discusses when each representation is appropriate.

- ID: `pub-ffdd3143e084`
- Source: https://arxiv.org/abs/1908.08572
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Heterogeneous Graphlets

Small connection patterns help describe a network, but node and edge types also matter. This work defines typed graphlets and develops efficient counting methods for capturing richer patterns in heterogeneous graphs.

- ID: `pub-830d6a5776a7`
- Source: https://doi.org/10.1145/3418773
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: Journal version (TKDD); a 2019 workshop entry is also listed.

### Interactive Event Sequence Prediction for Marketing Analysts

ProFlow helps marketing analysts explore and predict sequences of events. Its interactive visual interface brings model predictions into the analysis workflow, and a study with practitioners examines usefulness and limitations.

- ID: `pub-fe84cf73e778`
- Source: https://doi.org/10.1145/3334480.3382971
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### A Formative Study on Designing Accurate and Natural Figure Captioning Systems

What makes a figure caption both accurate and natural? An analysis of human-written captions identifies reusable information units and motivates a two-stage approach: generate accurate units, then combine them into readable text.

- ID: `pub-a79c58eb1b3f`
- Source: https://doi.org/10.1145/3334480.3382946
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Fast Hierarchical Graph Clustering in Linear-Time

Large networks contain communities within communities. The hLP method discovers this hierarchy with linear worst-case time and space costs, making hierarchical clustering and visualization practical for much larger graphs.

- ID: `pub-036056f79548`
- Source: https://doi.org/10.1145/3366424.3382673
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### From Closing Triangles to Closing Higher-Order Motifs

A potential link can complete a triangle or a more complex network pattern. This paper introduces motif-closure scores for ranking links and shows why the most useful pattern depends on the network's structure.

- ID: `pub-7f6f4e162b10`
- Source: https://doi.org/10.1145/3366424.3382688
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### A Structural Graph Representation Learning Framework

HONE learns about a node's structural role from patterns in its surrounding graph. It uses higher-order motifs and efficient diffusion to capture similarities that proximity-based embeddings can overlook.

- ID: `pub-32a075c8eb20`
- Source: https://doi.org/10.1145/3336191.3371843
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Figure Captioning with Reasoning and Sequence-Level Training

Automatically describing a chart requires reading its labels and the relationships between them. This work introduces attention mechanisms for both, plus sequence-level training to improve the generation of complete figure captions.

- ID: `pub-25d3af313163`
- Source: https://doi.org/10.48550/arxiv.1906.02850
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2019

### Attention Models in Graphs: A Survey

Attention lets a graph model focus on the neighbors or structures relevant to a task. This survey organizes graph-attention methods by their inputs and outputs, attention mechanisms, and applications, and discusses open challenges.

- ID: `pub-49b4758a12e7`
- Source: https://arxiv.org/abs/1807.07984
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Graph Convolutional Networks with Motif-based Attention

A graph node may need information from more than its immediate neighbors. Motif Convolutional Networks use attention to choose among higher-order neighborhood patterns, improving how a model represents each node for classification.

- ID: `pub-5695eeddd7fa`
- Source: https://doi.org/10.1145/3357384.3357880
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Heterogeneous Graphlets

Typed graphlets describe small network patterns together with the types of their participating elements. The work develops efficient counting techniques so these richer patterns can be used in large heterogeneous networks.

- ID: `pub-713f783e2d6e`
- Source: https://doi.org/10.1145/3418773
- Basis: `related_version_abstract` · Status: `version_check_needed`
- [ ] Owner approved
- Check: Workshop entry; overview checked against the same-titled journal abstract. Verify version-specific details before adding results.

### Towards Robust and Discriminative Sequential Data Learning: When and How to Perform Adversarial Training?

Perturbing every part of a sequence equally may obscure the information needed for classification. This work studies when and how to add adversarial perturbations, with the aim of learning more robust and discriminative sequence models.

- ID: `pub-976cb20ede31`
- Source: https://doi.org/10.1145/3292500.3330957
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Latent Network Summarization

Multi-LENS stores a compact structural summary of a network rather than a dense embedding for every node. Node representations can be generated when needed, reducing storage while supporting tasks such as link prediction and anomaly detection.

- ID: `pub-4b71368e584c`
- Source: https://doi.org/10.1145/3292500.3330992
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Visualizing Uncertainty and alternatives in Event Sequence Predictions

A single predicted event sequence hides uncertainty and plausible alternatives. This visualization shows both, and a user study examines how seeing alternative paths changes people's decisions and confidence.

- ID: `pub-13518987202d`
- Source: https://doi.org/10.1145/3290605.3300803
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Domain Switch-Aware Holistic Recurrent Neural Network for Modeling Multi-Domain User Behavior

People move between domains during a sequence of online actions. DS-HRNN explicitly models those switches in one recurrent network, sharing information across domains to predict future behavior.

- ID: `pub-b54c64136f39`
- Source: https://doi.org/10.1145/3289600.3291019
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2018

### Conversion Prediction from Clickstream: Modeling Market Prediction and Customer Predictability

This work predicts whether an online shopper will return to buy. It combines product-level and customer-level patterns, then uses responses to retargeting ads to identify when a more individualized prediction is needed.

- ID: `pub-92734226f088`
- Source: https://doi.org/10.1109/tkde.2018.2884467
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Dynamic Network Embeddings: From Random Walks to Temporal Random Walks

The order of interactions matters in a changing network. This work extends random-walk embedding methods with time-respecting walks, so the learned representations retain temporal dependencies rather than treating the graph as static.

- ID: `pub-744c1259b640`
- Source: https://doi.org/10.1109/bigdata.2018.8622109
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Predictive Analysis by Leveraging Temporal User Behavior

TRNN models both a user's actions and their timing. It predicts future behavior and learns reusable user representations, which are evaluated on tasks such as purchase conversion and application preference prediction.

- ID: `pub-ec796559067a`
- Source: https://doi.org/10.1145/3269206.3272032
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Perceptual Similarity Ranking of Temporal Heatmaps Using Convolutional Neural Networks

Two event histories can look similar in ways a hand-written distance misses. Heat2Vec learns from temporal heatmap images to rank sequences by visual similarity, comparing its results with human judgments.

- ID: `pub-12c4e4b2515f`
- Source: https://doi.org/10.1145/3267799.3267803
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Continuous-Time Dynamic Network Embeddings

Continuous-Time Dynamic Network Embeddings uses walks that respect the order of interactions. This preserves temporal information that static graph snapshots can discard, producing representations for learning on evolving networks.

- ID: `pub-ecabef0a85c9`
- Source: https://doi.org/10.1145/3184558.3191526
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2017

### WimNet: Vision Search for Web Logs

WimNet explores visual search over web activity logs to help find users with similar usage patterns. It addresses the difficulty of comparing heterogeneous behavior across many devices and websites.

- ID: `pub-1379fcb9339a`
- Source: https://doi.org/10.1145/3041021.3054256
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Probabilistic Visitor Stitching on Cross-device Web Logs

The same person may browse from several devices without logging in. This probabilistic approach combines evidence across sessions and reasons collectively about identity, handling noisy or missing signals in visitor stitching.

- ID: `pub-865d67b73766`
- Source: https://doi.org/10.1145/3038912.3052711
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Predicting Online Purchase Conversion for Retargeting

Retargeting depends on knowing which browsers may return as buyers. This model combines patterns at the customer and product levels to estimate purchase conversion from web logs.

- ID: `pub-7c7f6ae22b9e`
- Source: https://doi.org/10.1145/3018661.3018715
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2016

### Browsing2purchase: Online Customer Model for Sales Forecasting in an E-Commerce Site

Browsing2purchase uses customers' browsing histories to forecast product sales. It aggregates signals of purchase intent into a customer model, connecting individual browsing behavior with demand at the product level.

- ID: `pub-981e763d38a3`
- Source: https://doi.org/10.1145/2872518.2889394
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Purchase Intention Mining by Leveraging Item-Item Relationship

This poster studies purchase intent through relationships between items. A detailed account of its method and findings is awaiting verification against the original poster.

- ID: `pub-ee17de3e06a5`
- Source: https://www2016.uqam.ca/fichier/document/programBook/www2016_Program_Book.pdf
- Basis: `title_only` · Status: `source_needed`
- [ ] Owner approved
- Check: Only the official WWW 2016 poster listing was located. Topic-only description; do not add method or result claims without the poster.

## 2015

### Tumor Stratiﬁcation with Four Somatic Mutation Proﬁles

This work compares ways to represent sparse tumor mutation data for grouping patients. It studies suitable similarity measures and compact profiles based on biological knowledge and matrix factorization, evaluating the resulting tumor subtypes.

- ID: `pub-c5d57bbcfb6b`
- Source: https://delab.yonsei.ac.kr/jekyll%28backup%29/jekyll/assets/files/publication/legacy/201507_An%20phenotype%20specific%20blustering%20method%20in%20cancer%20data.pdf
- Basis: `paper_excerpt` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: ISMB/ECCB abstract A009 lists Lee Sael first; homepage lists Sungchul Kim first. Verify author order before changing Selected eligibility.

### Spoiler Detection in TV Program Tweets

Short social posts can reveal TV or sports results before someone has watched them. This work uses four informative features and an SVM to detect spoilers, and explores self-training to reduce manual labeling effort.

- ID: `pub-88862e014595`
- Source: https://www.sciencedirect.com/science/article/abs/pii/S0020025515006593
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: Homepage cites 2015; publisher volume is February 2016 (online DOI contains 2015). Confirm desired year convention.

### A Mutation Profile for Top-k Patient Search Exploiting Gene-Ontology and Orthogonal Non-negative Matrix Factorization

Finding patients with similar mutation patterns is difficult when genomic data is sparse and high-dimensional. This method combines Gene Ontology with matrix factorization to build compact profiles for efficient similarity search and tumor grouping.

- ID: `pub-80b34c4aa69e`
- Source: https://doi.org/10.1093/bioinformatics/btv409
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2014

### Identifying cancer subtypes based on somatic mutation profile

The way mutation data is represented changes which tumor subtypes a clustering method finds. This study compares binary and weighted mutation profiles with different distance measures, evaluating the groups against clinical features and survival data.

- ID: `pub-2eb39f2a0c5f`
- Source: https://doi.org/10.1145/2665970.2665980
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: Abstract reviewed via the author-associated ResearchGate record. The coauthor homepage PDF link currently returns 404; publisher DOI retained. Full text not reviewed.

### When to recommend: A new issue on TV show recommendation

A TV recommender must decide when to interrupt, not just what to suggest. ShowTime combines viewing preferences, program timing, and the cost of an unwanted interruption to choose more useful recommendation moments.

- ID: `pub-fb6cc6fdab55`
- Source: https://www.sciencedirect.com/science/article/abs/pii/S0020025514005210
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Processing time-dependent shortest path queries without pre-computed speed information on road networks

Road traffic changes as drivers enter a network, so routes based only on historical speeds can quickly become outdated. This work models speeds as continuous, changing functions and updates affected vehicles after each route decision, aiming to reduce both individual and total travel time.

- ID: `pub-4b9bbcf9a26c`
- Source: https://trid.trb.org/View/1290738
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: Publisher abstract reprinted with permission in the Transportation Research Board record; DOI 10.1016/j.ins.2013.07.009. Full text not reviewed.

### Advertiser-Centric Approach to Understand User Click Behavior in Sponsored Search

This work models ad clicks from the advertiser's perspective. It separates relevance to a query from the attractiveness of an ad, helping identify aspects of ad content that an advertiser can improve.

- ID: `pub-e3c466445938`
- Source: https://www.sciencedirect.com/science/article/abs/pii/S0020025514001649
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### LMDS-based Approach for Efficient Top-k Local Ligand-Binding Site Search

Searching for similar protein binding sites can be slow. This method embeds site similarities relative to landmark examples, enabling faster approximate retrieval while exposing a trade-off between speed and the recovery of exact neighbors.

- ID: `pub-f3aedaa1cf3d`
- Source: https://doi.org/10.1504/ijdmb.2015.070066
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2013

### Efficient Protein Structure Search using Indexing Methods

Similar protein shapes can help researchers study protein function. This work indexes compact 3D surface descriptors and refines candidate matches, accelerating structure search without comparing every query exhaustively against the full database.

- ID: `pub-8eba74d60ce7`
- Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3618241/
- Basis: `paper_excerpt` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Efficient Local ligand-binding site search using Landmark MDS

Fast Patch-Surfer speeds up the search for similar local protein binding sites. It uses landmark multidimensional scaling to represent similarities compactly, trading some retrieval accuracy for much faster searches.

- ID: `pub-e61799baafcc`
- Source: https://doi.org/10.1145/2512089.2512092
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Don’t be Spoiled by Your Friends: Spoiler Detection in TV Program Tweets

Spoiler detection needs to work on very short posts, where ordinary topic models struggle. This study identifies four useful features and tests them on tweets about a reality TV show to distinguish spoilers from harmless discussion.

- ID: `pub-3c90069e4b91`
- Source: https://doi.org/10.1609/icwsm.v7i1.14446
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2012

### Indexing Methods for Efficient Protein 3D Surface Search

This work accelerates protein surface search by indexing compact 3D shape descriptors. A two-stage variant retrieves candidates using a reduced representation and then checks them with the full descriptor.

- ID: `pub-f53ffed2c52a`
- Source: https://doi.org/10.1145/2390068.2390078
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Finding Core Topics: Topic Extraction with Clustering on Tweet

Tweets are short and informal, making conventional topic extraction difficult. Core-Topic-based Clustering jointly discovers topics and groups tweets, aiming to produce coherent clusters with distinct central themes.

- ID: `pub-310d68f544c3`
- Source: https://doi.org/10.1109/cgc.2012.120
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Multilingual Named Entity Recognition using Parallel Data and Metadata from Wikipedia

Wikipedia can provide weak supervision for entity recognition in multiple languages. This method combines page metadata with parallel English–foreign-language sentences, using a semi-CRF to infer entity labels for the target language.

- ID: `pub-4e33cc76f8d1`
- Source: https://aclanthology.org/P12-1073/
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2011

### Advertiser-Centric Approach to Understand User Click Behavior in Sponsored Search

What makes someone click a sponsored ad? This factor-graph model separates query relevance from ad attractiveness and identifies useful wording signals, focusing on changes an advertiser can make rather than only on search-engine ranking.

- ID: `pub-2f7da23ae55d`
- Source: https://doi.org/10.1145/2063576.2063905
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

## 2010

### Passive Sampling for Regression

Selecting useful regression examples need not require repeatedly retraining a model. This work samples using the geometry of the input data, studying a cheaper and more stable alternative to error-driven active sampling.

- ID: `pub-04e8f85fbf4f`
- Source: https://doi.org/10.1109/icdm.2010.9
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### RankSVR: Can Preference Data Help Regression?

Sometimes relative preferences are easier to obtain than exact scores. RankSVR incorporates those preferences into regression and selects helpful ranking constraints, aiming to improve predictions without an excessive training cost.

- ID: `pub-82292332cbc8`
- Source: https://doi.org/10.1145/1871437.1871550
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### Enabling Multi-Level Relevance Feedback on PubMed by Integrating Rank Learning into DBMS

RefMed learns what a researcher considers relevant while searching PubMed. It integrates graded relevance feedback and ranking into a database system, so results can be refined interactively with relatively little feedback.

- ID: `pub-2d8d5ceaba39`
- Source: https://doi.org/10.1186/1471-2105-11-s2-s6
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### SVM Tutorial: Classification, Regression, and Ranking

An introduction to support vector machines for classification, numerical prediction, and ranking. The chapter explains the shared ideas behind these tasks, including margin-based learning and kernels for nonlinear patterns.

- ID: `pub-541ca48c9f2b`
- Source: https://www.researchgate.net/publication/229010211_SVM_Tutorial_Classification_Regression_and_Ranking
- Basis: `paper_excerpt` · Status: `draft_for_owner_review`
- [ ] Owner approved
- Check: Homepage cites 2010; the published handbook chapter is dated 2012. Title typo and truncated comma parsing need owner review.

## 2009

### VRIFA: A Nonlinear SVM Visualization Tool using Nomogram and Localized Radial Basis Function (LRBF) Kernels

VRIFA makes a nonlinear support-vector model easier to inspect. Its interactive visualization shows how individual features affect predictions, combining nomograms with a localized kernel and supporting feature selection.

- ID: `pub-28c2e0e02c56`
- Source: https://doi.org/10.1145/1645953.1646312
- Basis: `abstract` · Status: `draft_for_owner_review`
- [ ] Owner approved

### RefMed: Relevance Feedback Retrieval System for PubMed

RefMed is a PubMed search system that learns from a user's relevance judgments to improve result ranking. This overview is based on the related journal description; the original 2009 demonstration paper still needs a version check.

- ID: `pub-72bea8ff9e14`
- Source: https://doi.org/10.1186/1471-2105-11-s2-s6
- Basis: `related_version_abstract` · Status: `version_check_needed`
- [ ] Owner approved
- Check: Original 2009 demo not located. Overview is explicitly based on the related 2010 journal article. Verify exact version and citation.
