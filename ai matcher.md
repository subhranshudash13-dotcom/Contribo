AI Project Matcher
Answer a few questions and let our AI find the perfect GSoC projects for you

Select Your Skills
Choose all technologies and programming languages you're comfortable with (select as many as apply)

Languages
Python
JavaScript
TypeScript
Java
C++
C
Go
Rust
Ruby
PHP
Kotlin
Swift
R
Julia
C#
Shell
Frontend & UI
React
Vue
Angular
Svelte
Next.js
TailwindCSS
HTML/CSS
Three.js
D3.js
Flutter
Backend & Databases
Node.js
Django
Spring Boot
Flask
Express
Ruby on Rails
GraphQL
FastAPI
PostgreSQL
MongoDB
MySQL
Redis
SQL
DevOps & Infrastructure
Docker
Kubernetes
AWS
Firebase
Linux
Github Actions
Prometheus
WebAssembly
AI, ML & Science
Machine Learning
Data Science
Deep Learning
PyTorch
TensorFlow
Computer Vision
NLP
Matplotlib
Jupyter
Add custom skill (type and press Enter)...
0 skills selected
Next



Experience Level
What's your experience level with open source contributions?


Beginner
New to open source

Intermediate
Some contributions

Advanced
Many contributions
Back
Next



Interests & Preferences
What areas interest you most?

Location Preference
worldwide
Weekly Availability: 20 hours

Back
Next

Review & Match
Confirm your profile and find the perfect projects

Skills
TensorFlow
PyTorch
Experience
Intermediate
Location
worldwide

Availability
20 hours/week

Back
Find My Matches




Your Perfect Matches! 🎉
We found 80 projects that match your skills

Scroll down to see all matches

INCF
The Virtual Brian : New graphical widgets for JupyterLab
60%
The Virtual Brain (TVB) provides an open-source simulation framework for whole-brain network modeling. Unlike the traditional approach of using neurons at micro-scale level, TVB takes into account the brain regions and their interactivity. This proposal aims to enhance the TVB ecosystem by developing and improving interactive JupyterLab widgets — BCT metrics projection viewer, Connectivity_react widget and Unified Head widget. The new widgets proposed will extend TVB's analytical capabilities and improve the overall user experience for researchers studying large-scale brain connectivity patterns.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
UC OSPO
AI/ML Models for Agricultural Analytics on the National Research Platform
60%
The VINE project at Iron Horse Vineyards collects continuous agricultural data through LoRaWAN sensors (soil moisture, temperature, CO2, weather) and multispectral drone imagery, but lacks the ML models to turn this data into actionable predictions. This project builds three interconnected model tracks for the VINE precision agriculture platform, all trained on NRP's GPU clusters. First, predictive irrigation scheduling: time-series forecasting models (ARIMA, Prophet, LSTM) that predict soil moisture at multiple horizons and recommend when to irrigate before crop stress occurs. Second, plant health computer vision: CNN-based models (fine-tuned ResNet/EfficientNet) that analyze multispectral drone imagery to classify plant stress, detect pest damage, and estimate yield, producing spatial health maps per vineyard block. Third, harvest timing prediction: forecasting models (XGBoost, LSTM) that predict optimal harvest windows from sensor data, weather, and historical records. Deliverables: (D1) data ingestion and feature pipeline for sensors, imagery, and historical records, (D2) irrigation scheduling models with decision layer, (D3) plant health CV models with spatial health maps, (D4) harvest timing models, (D5) systematic model evaluation report with ablation studies, (D6) Dockerized inference services deployed on NRP Kubernetes with REST API, (D7) documentation and bi-weekly blog posts.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
JdeRobot
VisualCircuit Improving Functionality and Block Library
60%
VisualCircuit currently relies on hard-coded monolithic JSON blocks, making it difficult for the community to share and extend custom logic. This project solves that bottleneck by building a curated, reusable block marketplace hosted on GitHub Pages with automated CI validation workflows. Deliverables include the standalone marketplace site, a slim frontend integration layer for VisualCircuit, automated documentation publishing via GitHub Actions, and two end-to-end robotics applications demonstrating the complete workflow.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Open Food Facts
Open Food Facts Explorer - a new generation Frontend
60%
Open Food Facts Explorer is a next-generation frontend for exploring and contributing to the Open Food Facts ecosystem, built with modern technologies like SvelteKit. It aims to achieve full feature parity with the main platform by keeping it modern, scalable and contributor-friendly. This project aims to enhance Explorer by adding multi-platform support (Open Food Facts, Open Beauty Facts, Open Pet Food Facts, and Open Products Facts), improving product addition and editing workflows, integrating Open Prices and moderator only features and tools like Nutri-Patrol directly into the app. It will also introduce enhanced search capabilities and Robotoff-powered features to assist contributors. From a technical perspective, the focus will be on decoupling the frontend from the backend by strengthening the SDK usage, and leveraging reusable web components where appropriate while maintaining SvelteKit’s SSR benefits. “Transform openfoodfacts-explorer from a food-only prototype into a complete, multi-platform contribution tool that achieves feature parity with the main OFF website"

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Mixxx
Pipewire support for Mixxx
60%
Currently, Mixxx uses PortAudio as a high level abstraction over audio APIs across all supported platforms, which only exposes the common subset of all those APIs, missing Linux specific features and conventions. This implementation will add Pipewire audio API support to Mixxx for Linux, listen for PipeWire events to support soundcard hotplug and update routing UI according to changes made in an external patchbay. It will also allow Mixxx to route audio to and from any source/sink. This proposal also attempts to achieve ALSA comparable latency with the PipeWire backend.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
MLLAM
Generalizing to Probabilistic Forecasting Models
60%
The existing Neural-lam probabilistic forecasting model, GraphEFM, currently exists in an isolated branch (prob_model_lam) with a monolithic ARModel class encapsulating both the training, rollout, and single-step prediction functionality in a single file. Meanwhile, PR #208 refactors the deterministic models into a clean three-layer hierarchy: ForecasterModule (Lightning training harness), Forecaster (rollout strategy), and StepPredictor (single-step prediction). The GraphEFM model cannot be merged into main until it is ported to this new hierarchy. This project ports the GraphEFM model into the new hierarchy by refactoring it into three new classes that mirror the existing separation of concerns: GraphEFMPredictor (extends StepPredictor : owns the encoder, prior, decoder, latent variable logic), EnsembleForecaster (extends Forecaster : owns the AR rollout with separate prior and encoder paths), and EnsembleForecasterModule (extends ForecasterModule : owns the ELBO training, ensemble metrics, and visualization). Key design decisions include using explicit forward() and forward_encoder_path() instead of gating on self.training (handled automatically by PyTorch Lightning), making the predictor self-contained with its own per_var_std buffer, and replacing all hardcoded constants with the datastore API introduced in PR #208. Deliverables: - All components of the encoder/decoder moved, GraphEFM predictor that fulfills the contract of StepPredictor, EnsembleForecaster with both paths tested, and end-to-end graph efM training of --model graph_efm on MEPS, along with ensemble metrics. - KL/CRPS warmup schedules, ensemble parameters defined via configuration, Zarr-based ensemble prediction saving, additional ensemble visualizations, spread maps, and spaghetti plot, checkpoint backward compatibility, and architecture documentation.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
German Center for Open Source AI
On-line, Stream/Update Functionality for Regression
60%
skpro's probabilistic regressors have limited online/streaming support: only 3 of 20+ regressors implement update(), few meta-strategies exist, and there is no model persistence. This project adds: 1) native _update() for regressors with incremental APIs (NGBoostRegressor, BayesianLinearRegressor, BaggingRegressor) 2) composable meta-strategies (OnlineSlidingWindow, OnlineBatchMixture, OnlineExponentialForgetting) usable with any regressor 3) update() propagation through Pipeline and TransformedTargetRegressor 4) save()/load() ported from sktime's serialization pattern

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Neuroinformatics Unit
brainglobe-cellfinder: expand input support to 2.5D and single-channel data (Soumya Snigdha Kundu)
60%
Cellfinder currently expects full 3D whole-brain volumes with both signal and background channels, so brain slices (2.5D) and single-channel acquisitions are not first-class citizens. The codebase also mixes axis conventions, which makes dimensionality changes error-prone. A recent data-loading refactor introduces explicit axis tracking and a new class hierarchy for cube generation and augmentation; the 2D/2.5D and single-channel work proposed here will build on that foundation. The core deliverables are to standardise axis semantics as the foundation, add a 2D detection path for brain slices and refactor classification to support both 2D and 3D inputs, and make the background channel optional across the main API and classification pipeline.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
Strengthening Core Workflows and Notebook Integration in AnalySim
60%
This project will improve AnalySim’s core reliability by addressing fragile user workflows, improving query and search behavior, and making the JupyterLite integration more robust and maintainable. The work will also be supported by stronger automated testing and CI checks to help ensure long-term stability and reduce future regressions.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Kubeflow
OptimizationJob CRD for Hyperparameter Optimization in Kubeflow Katib
60%
This project addresses limitations in Kubeflow Katib current Experiment CRD, which uses a generic and loosely typed interface for hyperparameter optimization. This leads to fragile parameter injection, inefficient resource usage, and unreliable state handling for stateful algorithms. To solve this, I propose designing and implementing a new OptimizationJob CRD v1alpha1, a strongly typed API focused on hyperparameter optimization for TrainJobs. It introduces native parameter injection, persistent algorithm state handling, and a push-based metrics pipeline integrated with the TrainJob Progress API. The project will deliver a production-ready controller with a structured reconciliation loop, support for stateless and stateful optimization algorithms, SDK integration, and comprehensive testing, resulting in a more reliable and efficient HPO workflow.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
Contribute to LORIS: Improving reliability and maintainability in the electrophysiology browser
60%
This project aims to improve the reliability and maintainability of the LORIS electrophysiology browser through scoped enhancements to browser behavior, validation, testing, and documentation. I plan to begin by reviewing and reproducing known issues or limitations, then implement targeted improvements in small, reviewable stages with mentor feedback. The expected deliverables include a practical browser improvement, expanded automated test coverage, and developer-facing documentation that helps make the contribution sustainable within the LORIS codebase.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Genome Assembly and Annotation
Building a Perturbation-Aware LLM for Multimodal In Silico Perturbation Modelling
60%
Perturbation biology datasets across CRISPR screens, MAVE, and scPerturb-seq remain siloed in incompatible formats, making cross-modal reasoning about genetic perturbations nearly impossible at scale. This project builds a perturbation-aware LLM by fine-tuning BioMedLM on a curated multimodal training corpus derived from the EMBL-EBI Perturbation Catalogue, enabling natural language queries such as "what happens if gene X is knocked out in cell type Y?" Deliverables include a multimodal training corpus, a fine-tuned LLM prototype, a reproducible evaluation pipeline with gene-level splits distinguishing genuine generalisation from memorisation, and full open-source documentation for reuse by the Perturbation Catalogue team.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
#17 Project Experanto
60%
Implement an ast based behavioral filter enabling queries like `(treadmill>0 and eye is not nan) & screen == video`, and expand dataset support with brainsets-style integration of IBL Brain Wide Map and Allen Neuropixels.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Kubeflow
Project 6: MCP Server for Kubeflow SDK
60%
The Kubeflow SDK gives AI practitioners a clean Python interface to submit, monitor, and manage distributed training jobs on Kubernetes via TrainerClient. However, LLM-based developer tools currently have no standardized way to access this runtime context — they cannot see a TrainJob's status, stream its logs, or reason about why a job failed. This project extends the existing MCP server MVP (tracked in kubeflow/community#936) for the Kubeflow Trainer SDK. The goal is to deliver a production-ready MCP server that exposes the full TrainJob lifecycle through well-typed, LLM-accessible tools — enabling AI assistants to actively help developers debug, monitor, and operate their Kubeflow training workloads in real time.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
Semi-automated iEEG analysis and viewing in a clinical and research environment
60%
This project aims to further develop an open-source intracranial EEG (iEEG) analysis platform by integrating clinically relevant seizure detection and seizure onset zone (SOZ) estimation algorithms, along with enhanced visualization tools. The goal is to support clinicians and researchers through a semi-automated, transparent, and interactive workflow for epilepsy analysis. By combining automated methods with expert input, the platform will facilitate reproducible and interpretable analyses in both clinical and research settings.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
C2SI
ImageLab Interactive Learning
60%
ImageLab is a block-based image processing tool built with Blockly and OpenCV . It helps students learn image processing by building pipelines with visual blocks. Problem statement: This project has the following key issues: This project will implement "Interactive Learning Mode" transforming ImageLab into a transparent, collaborative, and scalable learning ecosystem. First, per-step processing that returns intermediate image outputs after every operator, displayed in a scrollable filmstrip timeline so students can see the output after each step and what each step is contributing for the final output. Second, an image analysis panel showing RGB histograms and metadata for any selected step. Third, pipeline persistence allowing students to save, load, version, and share pipelines using secure share tokens. Fourth, a batch processing engine to run one pipeline across multiple images concurrently with progress tracking and ZIP download. Fifth, custom composite operators (macros) that let students save reusable block sub-chains into the Blockly toolbox. Deliverables: A production-ready fully tested interactive step viewer, image analysis panel with Canvas-based histogram renderer, SQLModel backed pipeline persistence with HMAC share tokens, asyncio batch processing engine, and a macro system with DAG validation and Blockly toolbox injection.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
Reusable DSOMM Security Pipeline for EBRAINS MIP Platform
60%
The Medical Informatics Platform (MIP) currently lacks standardized automated governance for its federated infrastructure, leading to deployment friction and configuration drift. I plan to solve this by implementing a vendor-neutral CI/CD pipeline in GitHub Actions that automates Infrastructure-as-Code (IaC) validation and maturity assessment using the OWASP DSOMM framework. Key deliverables include a detailed DSOMM based infrastructure audit, an automated orchestration pipeline featuring IaC scanning and SBOM generation, and a reusable secure pipeline blueprint to enable scalable and reliable infrastructure management across the EBRAINS community.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
MLLAM
Flexible Graph Construction for Neural Weather Prediction
60%
Neural weather prediction models like neural-lam rely on graph neural networks, but the current graph construction pipeline is locked to rectangular grids — blocking support for irregular data sources like weather stations, satellite swaths, and icosahedral model grids (ICON, MPAS). This project replaces the hardcoded pipeline with a flexible, topology-agnostic architecture spanning two repositories (weather-model-graphs and neural-lam). The core work delivers three things: (1) a two-step mesh architecture that decouples node placement from connectivity, enabling any layout (triangular, prebuilt, density-adaptive) to combine with any connectivity mode; (2) a bridge layer that eliminates 600+ lines of duplicated code by making neural-lam call weather-model-graphs directly, validated through a shared schema contract; and (3) migration to PyTorch Geometric's HeteroData for type-safe, self-documenting graph representation. As stretch goals, the project introduces a graph quality metrics framework for comparing mesh topologies without training, density-adaptive meshing driven by data or prediction error, and spherical coordinate support to fix systematic distortion at high latitudes. I have already contributed the foundational PRs (#81, #91, #92, #123, #258) and authored the two strategic issues (#384, #385) that define this project's architecture.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
German Center for Open Source AI
Deep Learning-Based Causal Discovery Algorithms for pgmpy
60%
This proposal aims to implement three deep learning-based causal discovery algorithms in pgmpy: DiffAN, GraN-DAG, and CAREFL. Each algorithm leverages neural networks to go beyond classical score-based or constraint-based methods, enabling discovery on non-linear, non-Gaussian data. All three will be implemented inside pgmpy/causal discovery to isolate the soft dependencies (PyTorch, diffusers, nflows) from the rest of the library.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Genome Assembly and Annotation
Ask VEPai. Trained chatbot interface for Ensembl VEP web
60%
Ensembl VEP's web interface offers dozens of configuration options for variant annotation, overwhelming new users and generating recurring helpdesk queries. Ask VEPai is a locally-hosted, open-source AI assistant that translates natural-language descriptions into recommended VEP configurations with justifications. The system uses Retrieval-Augmented Generation (RAG) grounded in a curated knowledge base, with a deterministic constraint checker that catches species violations and option conflicts the model misses. Beyond the project brief's scope of option labelling, training data, and a prototype model, this proposal adds four components: (1) the constraint checker, empirically validated across three model sizes, (2) a quantitative evaluation framework with leave-one-out methodology and multi-run statistical replication, (3) a structured JSON schema mapping recommendations directly to VEP web form sections for "click to apply" integration, and (4) an interpretability layer where every recommendation includes a source citation traceable to the knowledge base. A working demo validated across Qwen 2.5 3B/7B/14B shows +19–30% Enable F1 from the knowledge base, with all code and results published. Core deliverables: expanded KB (~55 options), 15–20 gold-standard examples, RAG pipeline, constraint checker, JSON schema, evaluation report, and documentation. My availability (~400 hours) supports extending to a 350-hour Large project, adding QLoRA fine-tuning, attribution testing, FastAPI wrapper, and VEP output explainer.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
C2SI
RustCloud: Multi-Cloud GenAI Provider Integrations & BigQuery Support
60%
RustCloud unifies cloud provider APIs for Rust developers, but Generative AI support is completely missing. Every GenAI provider uses a different auth model, API style, and request format, forcing developers to maintain separate HTTP clients for each one. Rust has no equivalent of Python's LiteLLM or LangChain. This project delivers concrete LlmProvider implementations for AWS Bedrock, GCP Vertex AI, and Azure OpenAI, a complete GCP BigQuery module, a UnifiedLlmClient with Explicit/ModelBased/Fallback routing strategies, RetryMiddleware with exponential backoff, and a full test suite targeting 85%+ coverage with complete documentation. I have been contributing to RustCloud since March 2026 with 19 PRs across all four cloud providers, including working proof-of-concept implementations of all three GenAI providers and the routing layer. The GSoC period is where these drafts become production-quality, tested, and merged modules.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Kubeflow
Platform Scalability and Security
60%
Kubeflow's adoption at enterprise scale exposes critical bottlenecks in controller efficiency, security posture, and operational overhead. This project delivers six required improvements: (1) ConfigMap-driven database garbage collection for KFP pipeline runs, mirroring the existing artifact_retention_time pattern; (2) ScheduledWorkflow controller migration from legacy client-go informers to controller-runtime; (3) zero-trust NetworkPolicy enforcement for training job namespaces; (4) cross-namespace artifact security hardening with integration tests; (5) KFP dead code removal of deprecated manifests; and (6) Pod Security Standards compliance with CI regression gates. Stretch goals include Gateway API migration, Spark webhook readiness probes, and a Metacontroller migration design doc. This work builds on 12 pre-GSoC contributions (5 merged, 7 open) across 5 Kubeflow repositories.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
German Center for Open Source AI
sktime - Interfacing Foundation models
60%
sktime provides a unified Python API for time series forecasting, but its support for modern foundation models, large pretrained models capable of zero-shot forecasting, is still maturing. Several high-value models, such as Google TimesFM and IBM TinyTimeMixer, are not yet interfaced in sktime; existing foundation model adapters lack probabilistic output (predict_interval, predict_quantiles), and there is no shared wrapper to reduce the boilerplate cost of adding new models from the Hugging Face Hub. This project directly addresses those gaps. The primary deliverable is one production-ready foundation model adapter fully integrated into sktime's BaseForecaster API, with fit, predict, predict_interval, and predict_quantiles support, CI-passing tests, soft-dependency handling, and a usage tutorial.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
C2SI
Per-Session GDB Sandbox Architecture with Real-Time Debugging for GDB-UI
60%
GDB-UI currently supports only one user at a time because the backend shares a single global GDB controller across all requests. When two users debug simultaneously, the second session silently destroys the first with no error or warning. This proposal implements a three-phase solution. Phase 1 replaces the global controller with a thread-safe SessionManager that gives each user their own isolated GDB instance via a UUID session_id. A working implementation is already open as PR #131 with 15 passing tests, security fixes, and a live demo page. Phase 2 introduces WebSocket streaming with a per-session reader thread architecture so GDB output reaches the frontend in real time without blocking the server. Phase 3 moves each project into an isolated Docker container using the Docker SDK exec_start socket API for interactive GDB attachment, solving file descriptor exhaustion at the OS level. Deliverables: merged SessionManager with full test coverage, WebSocket streaming with reconnection handling, Docker sandbox with resource limits, security audit, and handover documentation.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Kubeflow
Project 5: Helm Charts for Kubeflow Pipelines and Katib — Danish Siddiqui
60%
KFP and Katib users deploying via Helm currently have no upstream-supported path — charts exist but drift from Kustomize baselines silently, with no parity validation or explicit support boundaries. I've spent the last few months contributing to kubeflow/manifests (12 merged PRs) and reading through the maintainer feedback on PR #3237 closely enough to understand exactly what the constraints are. Before writing this proposal I built a PoC branch that gets all 9 scenarios (2 KFP + 7 Katib) to 0% parity diff against the upstream Kustomize baselines, traced and fixed each failure class, and ran runtime smoke tests on Kind. The goal is to upstream that work properly — charts, CI, documentation, and a support matrix that makes the supported/deferred boundary explicit. I also added two things that came out of building the PoC: a scheduled drift detection workflow and a schema validation gate using helm lint + kubeconform, both already implemented and validated.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
DeepChem
OLMo Support For 7B models In DeepChem
60%
According to the Google Summer of Code (GSoC) project ideas listed for One proposed DeepChem project involves adding support for the OLMo Large Language Model (LLM) family to the DeepChem repository using the Hugging Face Model wrapper. The goal of this project is to enable DeepChem users to perform tasks such as text generation, classification, and continued pretraining with large language models, including Open Language Model (OLMo). I have already contributed several improvements to DeepChem’s HuggingFaceModel integration, including improving typing and validation for the fill mask method and implementing a new generate() function that wraps HuggingFace’s text generation API. I have also already demonstrated partial compatibility with OLMo models through recent contributions to the generate() function and example scripts using allenai/OLMo-1B-hf. I have also added support for causal language modeling in the HuggingFaceModel wrapper, including integration with AutoModelForCausalLM and end-to-end validation through unit tests. My contributions demonstrate familiarity with the DeepChem codebase and provide the foundation for extending DeepChem to support large language models such as OLMo.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Kubeflow
Agentic RAG on Kubeflow — Multi-Index Retrieval with Kagent & MCP
60%
Kubeflow's documentation, GitHub issues, and platform code are spread across dozens of repositories with no unified search. This project evolves kubeflow/docs-agent from a single-tool retrieval script into a multi-index Agentic RAG architecture with three MCP search tools (docs, issues, code), domain-specific ingestion pipelines (KFP), and a "Thin Context" MCP flow for IDE integration. All orchestration uses Kagent CRDs (Kubernetes-native). Deliverables: (1) Three MCP tools with dedicated Milvus collections and specialized chunking — issues at comment boundaries, code at YAML/AST boundaries; (2) Project's first test suite (71+ tests) with CI; (3) Idempotent pipeline upserts replacing the current destructive drop-and-recreate; (4) Developer IDE configs for Cursor/Claude Desktop; (5) Feedback logging for golden dataset accumulation; (6) RAGAS evaluation pipeline. Core work (PRs #140, #143) is already built and live-tested on OCI with 2,108 real chunks indexed.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
Integrating velocity modelling into PCNToolkit package
60%
The project aims to improve longitudinal normative modelling in PCNtoolkit by validating, debugging, and extending velocity-based models to support multiple timepoints per subject. The work will include integrating the updated models into the toolkit’s modular architecture, adding tests and documentation, and developing functionality for predicting individual brain changes over time from multiple past observations.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
UC OSPO
Extensions to the Scenic Driving Domain
60%
Scenic is a probabilistic programming language for generating and verifying environments of autonomous cyber-physical systems. Its driving domain- the primary interface for autonomous vehicle (AV) testing- is a Python library that parses OpenDRIVE road-network files and exposes lanes, roads, intersections, traffic signals, and agents as first-class Scenic objects. While the driving domain is powerful, it has several concrete limitations that hinder real-world usage: assertion failures and geometry artifacts on certain OpenDRIVE maps; a coarse-grained centerline-following model that accumulates error on curved roads; incomplete extraction of semantic road metadata; and absent lane-signal linkage that makes it impossible to write autopilot behaviors that respect traffic laws. This proposal addresses all of these gaps across two major tracks and five subtasks, matching the project outline provided by the mentors: - Track 1 (~4 weeks): Robustness - fix known bugs, expand the test suite. - Track 2 (~5 weeks): Features - Frenet-frame geometry, lane-following distance, semantic tags, signal-lane linkage, and modular scenario components. Each subtask explained in the proposal will produce independently reviewable pull requests, letting mentors integrate work incrementally. The result is a driving domain that is meaningfully more robust, more expressive, and better validated than today.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
C2SI
Adversarial Validation Module for ACF SDK
60%
Build the Policy Audit Point (PAP) for ACF-SDK that fires real attack payloads through the enforcement chain, records what gets caught and what slips through, and produces a coverage matrix. Includes 50+ attack patterns mapped to OWASP LLM Top 10, pytest integration, OpenTelemetry trace emission, and regression testing for policy changes. Structured as a research pre-registration targeting ACM AISec or IEEE S&P DLSP Workshop

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
C2SI
DataLoom
60%
DataLoom is a browser-based data wrangling workspace that enables users to upload tabular datasets, apply reversible transformations, and manage data visually without writing code, supported by a checkpoint and revert system. Currently at the MVP stage, DataLoom supports only CSV files and lacks key capabilities such as data profiling, visualization, dataset merging, and efficient column selection. This project expands DataLoom into a full data preparation platform by introducing multi-format ingestion, automated data profiling, dataset joins and concatenation, formula-based transformations, reusable pipelines, interactive visualizations, and an automated data quality engine with scoring and one-click fixes. It also adds multi-format export and downloadable reports. Key deliverables include multi-format ingestion and export, a profiling API with a reusable column selector, join and merge operations, a visualization panel, a data quality engine, a formula editor, reusable pipelines, downloadable reports, a full frontend TypeScript migration, a refactored backend, comprehensive testing, and a redesigned scalable UI. The outcome is a robust, end-to-end data preparation tool that supports the complete workflow from raw data ingestion to cleaned, analyzed, and export-ready datasets.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
C2SI
Scalable Multi-Cloud Honeynet & Serverless Threat Intelligence Pipeline
60%
Deploying a honeypot is only half the battle; the real value lies in the intelligence we can extract from it. Currently, standard honeypot deployments leave valuable attacker logs isolated on individual virtual machines. If an instance is terminated, that threat data is gone forever, making it impossible to correlate global attack patterns or build a cohesive defensive strategy. This proposal shifts the C2SI Honeynet from a collection of isolated servers into a centralized, serverless Threat Intelligence Platform. Using Terraform and Ansible, I will build a modular framework to deploy secure, Dockerized sensor nodes across multiple cloud providers (AWS and GCP). Instead of logging locally, these edge nodes will use Fluent Bit to stream attacker telemetry in real-time to a centralized AWS S3 data lake. From there, an event-driven Python Lambda function will automatically enrich attacker IPs with global threat scores and geolocation data, making the raw attacks instantly queryable for researchers via Amazon Athena. I am not starting this project from scratch. To prove this architecture is viable and cost-effective, I have already engineered the core serverless pipeline, secured the remote Terraform state with DynamoDB locking, and built the hardened GCP modules in my preliminary Pull Requests (PR #8, #13, #14, #15, #35). Over the 350-hour GSoC period, my goal is to scale this proven foundation into a production-ready system that allows C2SI security teams to deploy a global honeynet and hunt threats with a single command.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
C2SI
Agent Conduit
60%
The Agent Conduit is a lightweight, self-hosted, unified agent gateway that addresses this problem end-to-end. Conduit is constructed around four pillars. An AAP-compliant Identity Server that provides each agent with its own cryptographic identity. A Platform Connection Registry that centralizes and governs credentials for Slack, GitHub, Google, and any REST API. A Token Router that provides tool schemas on demand rather than loading them all up front, and a structured Observability layer that attributes every action to the agent that took it.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
Project #27: Integrating Personalized HRF in The Virtual Brain & EBRAINS
60%
This project will have the aim to derive the empirical HRF for each brain region and each subject from BOLD recordings, and then to use this HRF in a computational model of brain activity (The Virtual Brain, implemented in EBRAINS). The legacy approach will be compared with the proposed one.The final pipeline will be implemented and validated on EBRAINS, ensuring full compatibility with the TVB cloud environment.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Kubeflow
Dynamic LLM Trainer Framework for Kubeflow — TRL Backend with Pluggable Multi-Framework Support
60%
Kubeflow Trainer V2 currently supports only TorchTune as its LLM fine-tuning backend. TorchTune stopped adding new features in July 2025, leaving Kubeflow with ~4 supported models and no support for DPO, GRPO, or other post-training methods. This project builds a pluggable multi-backend framework for Kubeflow Trainer. The first new backend is TRL (HuggingFace's fine-tuning library), adding support for SFT, DPO, GRPO, Unsloth acceleration, and multi-node DeepSpeed. The architecture includes: an LLMBackend ABC + registry in the Python SDK for config-driven backend dispatch, a LLMFrameworkHandler interface in the Go control plane (Torch plugin) for zero-touch extensibility, and entry_points-based registration so the community can add backends like LlamaFactory without upstream changes. Deliverables: TRL backend (Python SDK + Go handler), pluggable registry, runtime configs, integration tests, and documentation. All existing TorchTune workflows remain unchanged.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
#40: QC-Studio-integrated quality control toolkit for MRI datasets
60%
MRI quality control (QC) is an essential but highly manual and repetitive process in neuroimaging research. Currently, reviewers must navigate scattered directories and mentally integrate diverse outputs, such as 3D volumes, SVG montages, and isolated metrics, to make a reliable assessment. This "hidden labor" takes significant time away from actual research, introduces variability across different raters, and results in decisions that are poorly documented and difficult to audit. This project aims to transform QC-Studio from a working prototype into a robust, Nipoppy-integrated application. The core of the solution focuses on replacing hardcoded file paths with a scalable, config-driven architecture utilizing Nipoppy's DatasetLayout API. Additionally, the project will inject essential quantitative context into the review process by building an Image Quality Metric (IQM) distribution panel. Finally, it will establish a structured "Evidence Bundle" to experimentally evaluate whether a lightweight LLM-based assistant can improve review efficiency by summarizing quantitative data and flagging anomalies. Key Deliverables: 1) Config-Driven Architecture: A unified Streamlit application featuring dynamic subject loading, unified pagination, and manifest.tsv integration across multiple processing pipelines without hardcoded paths. 2) Quantitative Evidence Layer: An interactive IQM panel that visualizes subject-level metrics against local datasets and crowdsourced reference distributions (MRIQC Web API), complete with rule-based outlier detection. 3) Experimental AI Guidance Prototype: A foundational integration displaying pre-generated, LLM-authored summary reports within the dashboard, accompanied by an evaluation report assessing factual accuracy and workflow impact.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Kubeflow
End-to-End ARM64 Support & Validation on Kubeflow
60%
ARM64 is becoming increasingly common with the rise of Apple Silicon and cloud instances like AWS Graviton, but Kubeflow still doesn’t run consistently on ARM-based systems. Right now, different components behave differently — some work partially, some require manual fixes, and others don’t work at all. This makes it difficult to use Kubeflow reliably outside of traditional x86 environments . The goal of this project is to make ARM64 a properly supported architecture across the Kubeflow ecosystem. Instead of partial or experimental support, the idea is to make sure Kubeflow works the same way on ARM as it does on AMD64. To achieve this, I plan to start by auditing the container images used in Kubeflow and identifying gaps in ARM64 support. Based on that, I will enable multi-architecture builds using Docker Buildx and integrate them into existing CI/CD pipelines so that ARM64 images are built and published automatically. I will also update manifests to remove architecture-specific references and ensure they work across both architectures without requiring changes. A major part of the work will be validation. I will deploy Kubeflow on ARM-based environments (OCI Ampere) and run end-to-end tests to catch issues that only appear at runtime. Any failures related to dependencies, builds, or configuration will be debugged and fixed incrementally. By the end of the project, Kubeflow should be able to run end-to-end on ARM systems without manual workarounds. The final output will include working multi-architecture builds, improved CI/CD pipelines, updated manifests, and a clear “golden setup” guide for running Kubeflow on ARM. Overall, this project is about making Kubeflow more consistent and usable across modern infrastructure, especially as ARM adoption continues to grow.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
BreathState: A Cross Platform App for HRV Biofeedback and Resonance Breathing Protocols
60%
Problem: Currently, resonance frequency-based HRV training is backed by robust scientific evidence, but it remains inaccessible to the masses due to the high costs of proprietary hardware and software tools. There is a need to bridge the gap between basic consumer wearables and professional open-source psychophysiological research. Solution: BreathState 2.0 solves this by evolving the existing mobile application into an active, multi-modal, clinical-grade biofeedback platform. This will be achieved by introducing cross-platform architecture (Mobile/Web/VR), integrating research-grade hardware (Vernier respiration belts), and porting Python-based professional analytics natively to the application. Deliverables: A multi-patient database architecture using Drift with CSV export capabilities. Cross-platform application builds supporting Android, iOS, and Web. Integration of Vernier GDX-RB respiration belts via BLE with Polar H10 synchronization. A full on-device NeuroKit2-to-Dart analytics engine (computing time-domain HRV, frequency-domain HRV, RSA, and Baevsky Stress Index). A real-time biofeedback dashboard featuring dual-axis waveforms and adaptive guided breathing. An immersive WebXR HRV visualization scene (breathing sphere) accessible via Meta Quest headsets.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
UC OSPO
DATA PORTABILITY BACKUP AND OFFLINE PEERCHAT FOR PEERSKY BROWSER
60%
Peersky users currently lack built-in mechanisms to back up their P2P browsing state (IPFS blocks, Hypercore feeds, chat history, and tab sessions), meaning that reinstalling, machine failure, or going offline results in total data loss and broken communication. This project implements a robust Backup & Restore system that bundles P2P application data into portable .zip archives, supports CID-based distribution via IPFS/Hypercore, and provides cross-browser tab imports via a companion extension. Additionally, it upgrades the browser's PeerChat system with offline resilience, utilizing Hyperswarm’s local UDP multicast discovery to enable seamless messaging on local area networks (LAN) when internet connectivity drops. Key deliverables include: worker-threaded backup/restore daemon; P2P storage integration (Helia); a first-launch tab-import wizard; granular cache management UI; and dynamic LAN-only fallback networking configurations for PeerChat.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
JdeRobot
RoboticsAcademy: Drone Cat-Mouse Chase with Two Concurrent Drones
60%
This project is about bringing back the drone-cat-mouse chase exercise in the new RoboticsAcademy architecture. Right now this exercise does not work with Gazebo Harmonic and Aerostack2 which is what all the current drone exercises use. My plan is to set up a Gazebo Harmonic world with two drones — a cat drone that the user programs and a mouse drone that flies autonomously following a 3D pattern. Each drone will have its own full Aerostack2 stack. The mouse drone will run its flight pattern directly through Aerostack2 without HAL.py since its behavior is predefined. The user programs only the cat drone through HAL.py to chase the mouse. Deliverables include the complete Gazebo Harmonic world, dual-drone Aerostack2 setup, the exercise integrated into RoboticsAcademy with the RADI container, documentation, and a reference solution.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
JdeRobot
Robotics Academy: Palletizing with an Industrial Robot Exercise
60%
RoboticsAcademy provides browser-based robotics exercises where students write Python control logic without dealing with ROS2, simulation, or motion planning infrastructure. The existing industrial robot exercises (Pick & Place, Machine Vision) cover basic manipulation tasks but lack a palletizing exercise — one of the most common real-world industrial automation tasks. This project delivers a complete palletizing and de-palletizing exercise built on ROS2 Humble and Gazebo Harmonic, using a UR5 arm and the IFRA-Cranfield API as baseline. The exercise introduces a dynamic conveyor-fed object supply chain, programmatic pallet grid computation, multi-layer collision-aware motion planning, and a full de-palletizing sequence — all accessible through a clean Python HAL without writing a single line of ROS2 or MoveIt2 code. Deliverables include a Gazebo Harmonic simulation world with conveyor feeding assembly, an extended HAL with four new methods, a dynamic MoveIt2 collision scene, browser integration via the RoboticsAcademy interface, student and maintainer documentation — targeting a 350-hour GSoC commitment across 12 weeks.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
INCF
SciCommons Fullstack Development and AI Features
60%
SciCommons is an open source platform for researchers to interact, review, and discuss scientific papers. My project focuses on making the platform a more powerful tool for daily research. I will build a browser extension that lets users import articles instantly from sites like arXiv, PubMed, and Nature. I will also build an AI summarization feature using locally hosted Ollama models to help researchers process papers faster. To keep the site fully accessible for everyone, I will expand our automated testing coverage using PlayWright and Axe-core. Finally, I will integrate real-time social feeds on home page and a new split-pane preprint viewer to improve how we discover and read research papers.

TensorFlow
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
Neuroinformatics Unit
Napari-GUI for manual tracklets refinement
60%
This project aims to develop a napari-based GUI for interactive correction of pose-estimation tracks within the movement framework. It will enable users to resolve identity swaps in multi-animal datasets and correct keypoint errors efficiently. In multi-animal tracking, automated pipelines often fail due to occlusions, noise, and identity ambiguity. The proposed tool integrates visualization and editing into a unified workflow, allowing users to inspect and refine trajectories directly while maintaining standardized data structures. This will improve the quality and reliability of pose-estimation datasets, providing the open-source community with a robust and extensible solution for behavioral data curation. This project builds on an initial napari-based prototype that I have already developed for manual trajectory correction.

PyTorch
intermediate
💡 "Matched 1 of your skills. Perfect difficulty level."

View Full Project Details
UC OSPO
Developing a User-Centric Website for the Network Simulation Bridge (NSB)
45%
The Network Simulation Bridge (NSB) is a powerful co-simulation framework, but its current onboarding experience creates a barrier for new users due to fragmented documentation, absence of a clear “first success” path, and setup complexity. This project aims to design and develop a user-centric website that transforms onboarding into a structured and intuitive flow. The core focus is enabling users to run a working NSB example quickly through a quickstart-first approach, followed by progressive introduction of concepts, configuration, and simulator integration. The solution includes building a complete website with a guided Get Started system, reorganized documentation, and clearly defined learning paths, along with a progressive simulator integration strategy that begins with a simplified environment before moving to full simulator workflows. Key deliverables include a deployable NSB website with structured navigation, a guided onboarding flow centered on first success, unified documentation migrated from the repository, and tutorials with progressive learning pathways, validated through user testing and iteration. This project will reduce onboarding friction, improve usability, and make NSB more accessible to students, researchers, and developers.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
INCF
ImageJ Active Segmentation platform: Parallel Engine for ASP/IJ
45%
This project accelerates the convolution core of the Active Segmentation Plugin (ASP) in ImageJ by offloading its most compute-intensive pixel operations to parallel hardware using TornadoVM. The goal is to achieve significant speedups without altering existing functionality or behavior. The approach focuses on identifying CPU bottlenecks, converting them into accelerator-friendly kernels, and executing them through a reusable TornadoVM pipeline. A strict correctness-first methodology ensures all accelerated outputs match the CPU reference in terms of boundary handling and numerical accuracy before any performance gains are considered. By integrating a robust, reusable parallel execution layer with safe CPU fallback, this work transforms ASP’s performance while preserving its reliability—laying the foundation for scalable acceleration across multiple filters and larger image-processing workflows.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
C2SI
Agentic Cognitive Firewall SDK
45%
LLM agents built with LangGraph and LangChain retrieve documents, call tools, and write to memory - but nothing validates what enters the model's context. A poisoned RAG document can hijack an agent's behaviour. A malicious tool parameter can exfiltrate data. A single memory write can silently alter every future response. There's no standard security layer for any of this. ACF-SDK is a Zero Trust firewall that sits between the agent and the LLM - intercepting every input across four hooks (prompt, context, tool call, memory) and enforcing policy-as-code decisions through an isolated Go sidecar. I want to take this pipeline from hardcoded ALLOW to real enforcement: upgrade the semantic scanner to catch paraphrased attacks, wire scanner signals into the real sidecar, build memory write protection with HMAC and provenance tracking, ship a Docker demo anyone can clone and run in 5 minutes, and stress-test the whole system against adversarial evasion techniques with a technical evaluation report. The foundation is already built. I've shipped 6 PRs - semantic scanner, benchmark harness, LangGraph adapter, Rego policy templates for all four hooks, audit logger, and a Go scan stage implementation. 155 tests passing. GSoC wires these components into a running system and proves they hold up under real attacks.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
C2SI
CodeLabz GSoC 2026
45%
CodeLabz is an open source tutorial platform by C2SI built on React, Redux, and Firebase. The codebase has no TypeScript, uses deprecated MUI v4 patterns, React Router v5, and lacks key features like notifications and progress tracking. I will complete the TypeScript migration of the entire frontend and Cloud Functions, upgrade React Router v5 to v6, migrate MUI v4 styling to the modern sx prop, improve UI/UX across all pages, implement organization RBAC, build a real time notification system with Pub/Sub architecture, build an interactive quiz and progress tracking system, and optimize Firestore queries by adding missing composite indexes.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
UC OSPO
PeerSky Mobile Browser: Bringing P2P Web Browsing to Phone
45%
Mobile users currently lack native access to P2P protocols like hyper://, limiting the reach of decentralized web technologies. Although desktop browsers like PeerSky support these protocols, mobile platforms remain largely inaccessible without centralized gateways. To address this, this project proposes building PeerSky Mobile Browser, a React Native application for Android using Holepunch's bare-expo template, which provides the Bare runtime necessary for running Hypercore libraries that standard React Native cannot support. The project will implement native hyper:// protocol support with DHT-based peer discovery, basic HTTPS browsing via WebView, Holesail P2P tunneling through QR codes, and mDNS for offline discovery. So the core features will include secure key management using Android KeyStore, mobile-optimized UI with tab management, and comprehensive testing across Android versions. The deliverable will be a functional Android application that brings P2P browsing capabilities to mobile and extends the PeerSky ecosystem.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
UC OSPO
Optimizing and Evaluating CXL in the Memory Hierarchy through OCEAN
45%
CXL is an interconnect which uses memory disaggregation to overcome the memory bandwidth bottleneck from most workloads. OCEAN, one such CXL emulator built on-top of QEMU, has support for modern CXL3.0 features and supports multi-host communication is one emulator which has the potential to enable CXL-based studies. The infrastructure and studies performed by OCEAN are relatively new and limited. This project seeks to mature OCEAN's infrastructure by improving documentation, improving the accessibility and ease of setting up OCEAN, and improving the capturing of HW counter metrics which will later be used to asses how CXL can be integrated and used within the memory hierarchy to enable performance gains on HPC-class workloads.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
INCF
Explainable Spatio-Temporal Graph Evolution for Developmental Neuroscience
45%
This project studies the development of a tiny worm called Caenorhabditis elegans, focusing on how its cells divide, grow, and interact during its early embryonic stages. To map out and understand these complex interactions, the project upgrades the OpenWorm DevoGraph library using an advanced deep learning tool called the Explainable Spatio-Temporal Graph Evolution Learning (ESTGEL) model. This model tracks two critical dimensions of growth simultaneously: the 3D spatial arrangement of cells (how they physically touch and communicate in space) and the directed cell lineage (the family tree detailing how cells evolve to form different tissues). By combining these spatial and lineage pathways with an "edge attention" mechanism, the tool highlights the most critical cell-to-cell connections at various stages of growth. Ultimately, the project aims to get a complete, computationally explainable picture of the worm's development, from a single cell to a fully formed organism, and to successfully classify between healthy and mutant embryos. This work will help us learn more about basic life processes, track how early cell interactions influence neural wiring, and improve fields reliant on understanding cellular growth. The project is supported by the OpenWorm community, an international organization dedicated to using advanced dynamic graph neural networks to model and study the brain and nervous system development of the first virtual organism in a computer.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
Open Food Facts
Reference Database: A Ground-Truth Food Data Platform for Canada
45%
The Reference Database project aims to build a high-quality, reliable food data platform to complement and enhance Open Food Facts (OFF) in Canada. While OFF is a valuable open dataset, it can contain incomplete or inconsistent information. This project addresses these challenges by collecting and structuring trusted food product data from Canadian sources such as brand websites, retailers, and public registries. The goal is to create a clean and consistent dataset that improves data quality and supports downstream processing. The database will enable data enrichment, validation, and advanced use cases such as nutritional analysis, product categorization, and machine learning applications. It will also support better alignment with international standards and improve the overall reliability of food data. The project focuses on building a scalable data pipeline for data collection, cleaning, and integration, with the goal of delivering a functional MVP during Summer 2026.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
UC OSPO
CauST: Causal Gene Intervention for Robust Spatial Domain Identification
45%
Spatial transcriptomics methods identify tissue domains by clustering spatial gene expression patterns, but current approaches select genes using variance-based heuristics such as highly variable genes (HVGs). Many HVGs reflect donor-specific noise rather than genes that truly drive spatial organization, which leads to poor generalization when models are applied across tissue slices from different donors. This project addresses this limitation by introducing CauST, a framework for identifying causally important genes for spatial domain identification. CauST evaluates each gene through in-silico gene knockout experiments, measuring how much removing the gene changes the learned spatial embedding produced by a spatial graph neural network. To ensure robustness, the method then applies a cross-slice invariance criterion, selecting genes whose effects are both strong and stable across multiple donors. The resulting causally invariant gene set is used to retrain spatial domain identification models, enabling improved cross-donor performance without modifying the underlying model architecture. The project will deliver a production-quality open-source CauST Python package, integration with multiple spatial transcriptomics backbones (STAGATE, GraphST, and SpaGCN), a multi-dataset benchmark evaluating cross-slice robustness, visualization tools for interpreting causal gene importance, and tutorial notebooks and documentation to support adoption by the spatial transcriptomics community.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
UC OSPO
Kubernetes-Native LLM Chatbot for Intelligent Network Diagnostics
45%
This project proposes the development of a Kubernetes-native chatbot integrated with NRP's managed LLM service to provide intelligent network diagnostics assistance. The system will enable users to interact conversationally with the model, and get answers to questions about network performance.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
Mixxx
Rebuild the LateNight theme in QML
45%
This project will rebuild the LateNight skin as a 100% native QML interface, serving as an act of architectural liberation for the Mixxx codebase. By unwiring decades of complex, hardcoded C++ widget logic, the skin will be migrated to a dynamic, GPU-accelerated declarative ecosystem. This involves writing a dedicated C++ QmlThemeProvider bridge to manage dynamic JSON color palettes and assets, converting legacy WidgetStacks to fluid QML state machines, and assembling the deck structure using scalable DelegateChooser layouts. This deep structural re-engineering ensures the LateNight skin remains performant, responsive, and infinitely customizable for community derivatives on modern and portable hardware.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
Genome Assembly and Annotation
Expand genome metadata in Ensembl with AI tools
45%
﻿The Ensembl Plants and Metazoa platforms face a significant metadata gap where critical biological context, such as ploidy, strain, and sex, is often documented in peer-reviewed literature but missing from formal INSDC sequence archives. This lack of structured metadata, particularly ploidy, creates technical bottlenecks in downstream comparative genomics and requires labor-intensive manual curation. To address this, I propose developing a standalone, Python-based "Retrieve-Extract-Verify" module that leverages Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG) to automate metadata extraction from scientific papers. This tool will utilize literature APIs like Europe PMC, employing section-aware parsing and confidence scoring to ensure high data integrity with minimal human intervention. My previous experience in building Transformer-based bioprocess optimization models and genome-level embeddings directly informs my approach to handling complex biological datasets. The final outcome will be a ready-to-deploy Nextflow module designed for seamless integration into Ensembl’s production pipeline and provide the global research community with richer, more reliable genomic metadata.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
UC OSPO
NeuroHealth-Vision: A Volumetric Perception Module for Multimodal Clinical Reasoning
45%
The NeuroHealth-Vision project aims to bridge the "Protocol Gap" in 3D medical AI by developing a standardized evaluation and transfer-learning framework for volumetric foundation models (VFMs). While current generalist models excel in common thoracic or abdominal tasks, they often struggle with specialized clinical protocols involving unique acquisition physics and contrast kinetics. This project will systematically benchmark frontier architectures (like CT-FM, etc.) across various unseen specialty downstream tasks using zero-shot, few-shot, and Parameter-Efficient Fine-Tuning (PEFT) methodologies. Deliverables include open-source preprocessing pipelines for 3D volumetric normalization and spatial alignment, alongside optimized model weights and a comprehensive benchmarking report. This work will ultimately provide the multimodal "perception engine" for the broader NeuroHealth clinical assistant, enabling it to integrate high-dimensional imaging data into its diagnostic reasoning core.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
Open Food Facts
Canadian OLAP Integrated Database
45%
The Open Food Facts (OFF) Canada database contains information about branded food products, including their ingredients and nutritional values. This data acts as an integral part for several OFF applications, such as the recipe extension, search page extension, product page extension, and online store extension, which helps in answering user queries about food products. For these applications to respond efficiently, the underlying database must be highly performant and reliable. However, the current database contains inconsistent and incomplete data, which limits its effectiveness for analytics and query performance. The goal of this project is to design and implement an OLAP database by integrating recipe and food product data. This will involve building an ELT pipeline to clean, standardize, and augment the data so that both developers and users can retrieve insights quickly and reliably.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
DeepChem
DeepChem-Compatible RFDiffusion Implementation
45%
This project aims to implement state-of-the-art protein design models, RFDiffusion and RFDiffusion-2, within the DeepChem framework using a clean, end-to-end PyTorch pipeline. The goal is to make advanced generative protein modeling accessible through standardized DeepChem abstractions such as TorchModel, Dataset, and Featurizer, facilitating integration with existing deepchem workflows. The model leverages diffusion-based generative techniques to transform random noise into realistic protein structures, built on a RoseTTAFold inspired architecture that jointly captures sequence, pairwise interactions, and 3D geometry. By incorporating SE(3)-equivariant operations, the system ensures physically consistent predictions while maintaining modularity through the use of existing equivariant libraries.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
DeepChem
Machine Learning Interatomic Potentials (MLIP) in DeepChem using E(3)-Equivariant Neural Networks
45%
This project aims to develop a native PyTorch-based Machine Learning Interatomic Potential (MLIP) framework within DeepChem, enabling efficient prediction of molecular energies and forces without relying on external frameworks. MLIPs approximate the potential energy surface of molecular systems, providing a scalable alternative to Density Functional Theory (DFT) for molecular simulations. The project will implement a modular, production-ready framework supporting E(3)-equivariant architectures such as NequIP and MACE, fully integrated with DeepChem’s TorchModel API, graph-based data pipelines, and equivariance utilities. Key deliverables include a generalized MLIPModel abstraction, efficient graph construction and batching pipelines, a stable joint energy–force training system, and comprehensive benchmarking on MD17 and QM9 datasets, including molecular dynamics stability validation. The final outcome will be a fully integrated and extensible MLIP module within DeepChem, enabling end-to-end molecular simulation workflows.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
INCF
Project 39 NeuroSim As A Physics Constrained Model for Finite Horizon Network Control Theory
45%
The application of Network Control Theory to medical neuroimaging consistently faces the approximation crisis. Current tools rely on infinite-horizon continuous models, binary structural masking and statistically inaccurate harmonization. They fail to capture the discrete, finite time and stochastic truth of brain dynamics grounded in biology. This limits their use in computational psychiatry and biomarker discovery. NeuroSim is intended as a Python model built from scratch to resolve these problems. It aims to simulate in-silico brain stimulation with rigorous physics-based constraints. Over the 350 hour period, the three prime modules will be made available to the community:- 1. Discrete Finite Horizon Physics: A transition from standard iterative summations to discrete time Van Loan Doubling algorithm, significantly reducing computational load for large scale neural networks. 2. GraphNet based Laplacian Regularization: Implementation of a proximal gradient descent module to generate soft-prior connectivity matrices. This resolves the problem of structural blindness in binary DTI-based masking. 3. Bias-less Harmonization and Ground-truthing: Deployment of a NeuroCombat protocol to ensure data security in multi-site studies. Validation to be done against non-linear Wilson-Cowan neural mass simulations. Using the above modules, NeuroSim positions itself as a highly scalable, diagnostic-adjacent toolset capable of modelling complex neural mass transitions. It establishes a standard for next generation non invasive neuromodulation and macro-scale brain stimulation.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
INCF
ActiveVision: continued development of a data and model portal for the study of goal-directed vision
45%
This project builds an automated benchmarking ecosystem for goal-directed vision. It implements a high-priority leaderboard featuring automatic updates, submission validation, and multi-metric ranking for new Diffusion and VLM paradigms. It ensures reproducibility through versioned results for SOTA research.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
C2SI
Proposal for B0Bot
45%
B0Bot is currently a monolithic Flask application relying on synchronous, manual data ingestion and a single-pass LLM pipeline to retrieve cybersecurity articles. This current architecture creates significant bottlenecks: it requires manual scripts to update knowledge bases, scales poorly under heavy loads, lacks advanced reasoning capabilities, and delivers a generic "one-size-fits-all" news feed that ignores individual user preferences and behaviors.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
INCF
A Python Command Line Interface (CLI) for the CBRAIN Distributed Computing Platform
45%
The project develops an improved Python-based CLI for the CBRAIN distributed computing platform, aiming on usability and modular design. It replaces complex command usage with interactive, prompt-based workflows, reducing reliance on memorization. The system leverages existing CBRAIN API routes and restructures the codebase into a clean, feature-based architecture. It supports user, project, file, task, and data provider management, along with advanced operations like authentication, batch processing, multi-session, data upload / download, file querying / selection and server control. Administrative tools for logs, quotas, and system monitoring are included. Overall, the project delivers a scalable, maintainable, and user-friendly CLI that enhances productivity.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
OpenMS Inc
Unify Development Dependencies using Vcpkg
45%
Like many large scale software projects, OpenMS has numerous development dependencies. Unfortunately, there is no straightforward way to quickly and easily install all of these dependencies. Some can be installed using various package managers such as apt-get, brew, or choco, while others need to be installed with a Python package manager such as conda. And finally, some dependencies need to be compiled from source code manually. The proposed solution introduces a vcpkg manifest-based dependency system integrated through CMake toolchain support. To address performance challenges, especially for large dependencies such as Qt, a binary caching mechanism will be implemented using GitHub Releases, significantly reducing build times in both CI and local development environments. Existing contrib patches will be analyzed and minimized by leveraging upstream fixes and vcpkg ports, with overlay ports introduced only where necessary. The project will deliver a fully functional vcpkg-based build system for OpenMS, including cross-platform support (Linux, macOS, Windows), CI integration with caching, and validated compatibility with core components and pyOpenMS. This will improve build reproducibility, reduce maintenance overhead, and simplify the developer onboarding process.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
INCF
HarmonyHub Music Education Interface: Mobile App Hardening and Relative Intonation Learning
45%
HarmonyHub is an open-source platform designed to improve music education through interactive and technology-driven learning experiences. While the current application provides note practice and visualization features, its mobile experience requires improvements in performance, responsiveness, and stability. This project focuses on strengthening the mobile application by optimizing UI responsiveness, improving performance across devices, enhancing error handling, and introducing offline capabilities. In addition, it proposes the development of a relative intonation learning module built on top of the existing chromatic tuner, enabling users to practice pitch accuracy and musical intervals with real-time feedback. Key deliverables include a fully optimized mobile experience, a functional relative intonation training system with real-time feedback, improved audio processing performance, and cross-platform stability for iOS and Android devices. The final result will be a more robust, scalable, and pedagogically effective mobile application, making music learning more accessible, interactive, and engaging.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
UC OSPO
CellQuery-ST: Cell-Aware Query Grounding for Single-Cell and Neighborhood Retrieval from Histology
45%
CellQuery-ST addresses a key gap in computational pathology: while current models can predict gene expression or answer coarse slide-level questions, they do not support cell-aware querying of histology images. In practice, researchers and clinicians want to ask questions such as: Where are B-cell follicles? Which regions show inflammatory myeloid activity? Which neighbourhoods resemble a vascular niche? This project aims to make such biologically grounded querying possible on new histology slides. To solve this, I will build a cell-aware query grounding framework that uses spatial omics data for supervision during training but supports image-only inference at test time. Each slide will be preprocessed into a spatial index of cells, patches, and neighbourhoods, and natural-language queries will be matched against this index to retrieve or score relevant spatial evidence. The system will combine spatial pathology data with CellNet, an existing paired single-cell and language resource, to connect text queries with cell identities, cell states, and higher-level biological concepts. The main deliverables will be: (1) a benchmark covering four task families—cell type grounding, cell state/programme grounding, spatial niche grounding, and communication hotspot grounding; (2) a reusable slide indexing and retrieval pipeline for histology images; (3) reproducible baseline models and evaluation utilities for seen/unseen query generalisation; and (4) documentation and tutorial notebooks showing how to preprocess a new slide, issue queries, and evaluate results.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
JdeRobot
Exploring optimization strategies for RoboticsBackend container
45%
The JdeRobot Robotics Academy utilizes massive monolithic Docker images, which result in critical download issues for students, and demands insecure root daemon privileges to execute containers. To address this, I plan to design a highly optimized multi-stage build framework for RoboticsBackend, which will minimize total megabytes for download by students and reduce image size using strict apt layer squashing and source-level pruning of heavy ROS2 meta-packages like Aerostack2 and OMPL. Moreover, I will transform the execution framework to a secure, daemonless Podman-based container execution system, which will enable precise namespace mapping using –userns=keep-id and native display socket passthrough for safe execution of GUI-based Gazebo simulations without compromising host security. Deliverables : 1. Optimized Container: A new, optimized image with a mathematically provable reduction in total megabytes for download and build layers. 2. Rootless Execution: A fully functional Podman-based environment for secure execution of the entire database and frontend stack without a Docker daemon. 3. Developer Documentation: New official documentation on new multi-stage build paradigms and executing containers rootlessly.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
DeepChem
Single Cell and DNA Foundation Models
45%
DeepChem supports transformer-based foundation models for chemistry (ChemBERTa, MolFormer) but has no equivalent for genomic data. This project fills that gap by integrating DNABERT-2 into DeepChem, following the same design pattern used by ChemBERTa and MolFormer. The implementation consists of two components: (1) a DNABert model class that wraps HuggingFace's DNABERT-2 inside DeepChem's HuggingFaceModel/TorchModel hierarchy, supporting masked language modeling pretraining and fine-tuning for classification, regression, and multitask regression; and (2) a DNABertTokenizer that serves as both a HuggingFace tokenizer and a DeepChem featurizer, making it compatible with DeepChem's data loading pipeline. Deliverables include the fully integrated model and tokenizer classes, tests across all task modes, and benchmarks on a suitable genomic dataset.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
INCF
Expressive Gesture to Sound Mapping Framework for GestureCap
45%
This project develops an expressive gesture-to-sound mapping layer for GestureCap, enabling low-latency gesture data to control playable instruments such as a Hyper-Theremin. It focuses on continuous control, microtonality, and adaptive mappings to support expressive performance and accessibility.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
C2SI
Tarunya Webiu Propsal
45%
WebiU currently relies on request-time GitHub API calls with in-memory caching, which limits scalability and leads to redundant API usage. This project proposes an event-driven, serverless architecture using GitHub webhooks, queue-based processing, persistent storage, and distributed caching to efficiently aggregate and serve repository data. Additionally, lightweight AI features will be introduced to generate repository summaries and improve project discoverability. The final system will significantly reduce API usage, improve performance, and enable WebiU to scale to larger repository ecosystems.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
OpenMS Inc
imzML Parser in OpenMS
45%
Mass spectrometry imaging (MSI) is a powerful analytical technique that enables spatial mapping of molecules within biological tissues. The imzML format is the open standard for storing MSI data, consisting of an XML metadata file and an associated binary data file. OpenMS currently lacks native support for reading and writing this format. The goal of this project is to implement a robust imzML parser in OpenMS, enabling seamless integration of mass spectrometry imaging data into existing OpenMS workflows and applications. The proposed solution already demonstrates the ability to load and parse both continuous and processed imzML formats, including support for large datasets. The implementation has been benchmarked against pyimzML for validation and consistency. This project will further extend the work by integrating with OpenMS Python bindings (currently under development), while identifying potential challenges and outlining strategies and solutions to address them. Tasks: Implement a C++ imzML reader capable of parsing both continuous and processed imzML formats Develop an imzML writer to support exporting imaging data Add support for essential imzML metadata, including spatial coordinates, pixel size, and spectrum-level parameters Integrate the parser with existing OpenMS data structures (e.g., MSExperiment, MSSpectrum) Write comprehensive unit tests and validate functionality against reference imzML datasets Document the implementation and provide clear usage examples.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
UC OSPO
EnergyAPI: An End-to-End API for Energy-Aware Forecasting and Scheduling
45%
Electricity grids today serve a far more complex mix of consumers than they were designed for. Data centers, EV charging networks, and industrial facilities participate in demand-response programs, shifting flexible workloads to windows where electricity is cheaper or cleaner. Acting on those signals requires software that collects real-time grid data across multiple regions, forecasts how conditions will evolve over the next several hours, and exposes both through a clean API that developers can query directly. Existing open-source infrastructure for grid signal forecasting covers carbon intensity reasonably well, but critical gaps remain: the data acquisition layer and the API serving layer are not connected, fresh data does not automatically trigger model inference, and signals beyond carbon intensity such as demand, price, generation mix, and grid saturation are not exposed through any unified interface. There is also no interactive frontend that makes regional grid conditions spatially visible. EnergyAPI addresses each of these gaps. The platform is structured across five layers: an automated scheduled data acquisition service pulling from NOAA NOMADS, EIA, and ENTSO-E, an extended relational data model covering all five grid signals, a forecasting pipeline connecting fresh data to existing carbon intensity models while adding SARIMA-based demand forecasting and gradient boosting for price, a Django REST API with a workload scheduling interface that accepts SLOs and returns execution plans, and an interactive web frontend with time-series charts and a choropleth map of EU and US regions.

PyTorch
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
C2SI
TensorMap
45%
This project transforms TensorMap into a complete neural network design studio by introducing a data driven layer registry, expanding support to 15 layer types, enabling real time training visualization, model export in industry standard formats, post training interpretability tools and automated hyperparameter tuning. The system will improve scalability, usability and developer productivity while allowing users to design, train, analyze and optimize models visually.

TensorFlow
advanced
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
Genome Assembly and Annotation
Expose a Subset of ENA REST Services as MCP
30%
The goal of this project is to provide a Model Context Protocol (MCP) server that is suitable for production and exposes expected REST endpoints from the European Nucleotide Archive (ENA) as organised, schema-driven tools for AI systems. Although ENA offers robust REST APIs for biological data access, direct integration with AI agents frequently results in inconsistent queries, low reproducibility, and lack of validation. In order to overcome this, the project implements an MCP-based interface layer that ensures predictable execution, provides a strict input/output schemas, and enables secure, secure communication with ENA services. A dynamic tool registry for flexibility, Pydantic for schema validation, httpx for asynchronous API communication, and a response normalisation layer for consistent outputs are all features of the FastMCP-built system. To ensure scalability and production readiness, it will also include a comprehensive error handling, testing, and containerised deployment using Docker and Kubernetes. A fully functional MCP server with several ENA capabilities (such as study, sample, and run queries), thorough test coverage, developer-friendly documentation, and a deployable system that is simple to interface with AI clients are some of the key deliverables. This project will enable more dependable AI-driven scientific workflows by improving the reproducibility, traceability, and accessibility of biological data.

PyTorch
beginner
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
Genome Assembly and Annotation
Sequence similarity networks for the visualisation and exploration of MGnify Proteins
30%
My proposal is to develop a scalable computational pipeline to construct, annotate, and visualise Sequence Similarity Networks (SSNs) for a representative subset of approximately 10 million MGnify proteins. The pipeline will take FASTA files as input and utilise MMseqs2 to efficiently compute all-against-all pairwise sequence similarities. It will then use the Python library NetworkX to construct the mathematical graphs, integrating biological metadata, such as the biome-of-origin, directly into the node attributes to enable contextual environmental exploration. To ensure scalability and avoid memory bottlenecks, the pipeline will leverage NetworkX's backend dispatching architecture to route computationally heavy operations to high-performance GPU libraries like cuGraph. Finally, the graph data will be exported into simple tabular formats compatible with large-scale visualisation platforms like Cytoscape and Cosmograph. The deliverables of this project will include the core Python/Bash SSN generation pipeline, a MGnify metadata annotator, a graph exporter utility, a fully rendered 10-million node reference dataset, and comprehensive documentation alongside an integration test suite.

PyTorch
beginner
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
UC OSPO
Extending AIDRIN: Zarr & ROOT Readers, HDF5 Hardening, and Pluggable Data Ingestion
30%
This project extends AIDRIN’s data ingestion layer beyond CSV and basic tabular formats to better match real scientific workflows. I will (1) audit and harden the existing HDF5 path, (2) add new readers for Zarr and ROOT (via uproot), and (3) introduce a simple custom ingestion interface that normalizes user‑supplied data sources into a pandas DataFrame and metadata dictionary before AIDRIN’s metrics run. The work includes dataset/TTree selection UX, chunk‑aware reading for large N‑dimensional arrays, metadata extraction for FAIR-related metrics, and a full set of tests and documentation. By the end of the project, researchers will be able to use AIDRIN directly on common scientific formats and plug in their own loaders without modifying the core codebase.

PyTorch
beginner
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
German Center for Open Source AI
Correcting Statistical Inference for Smooth Terms in pyGAM - Accurate p values
30%
pyGAM currently produces anti-conservative p-values for smooth terms due to several deviations from the statistical theory outlined in Wood (2013b). In particular, it assumes a simple chi-squared reference distribution, ignores effective degrees of freedom corrections, and does not properly handle penalization-induced rank deficiency. This project will correct the statistical inference pipeline in pyGAM by implementing five key fixes: (1) proper computation of effective degrees of freedom, (2) stable pseudoinverse truncation, (3) replacement of the chi-squared approximation with a weighted mixture using the Liu-Tang-Zhang method, (4) QR-based covariance handling, and (5) correct treatment of unknown-scale families. The result will be a refactored inference module that produces well-calibrated p-values, along with a comprehensive validation suite comparing type-I error and power against mgcv. Stretch goals include incorporating smoothing parameter uncertainty corrections and exploring REML-based smoothing. Deliverables include a refactored statistics() pipeline, extensive tests, and improved documentation.

PyTorch
beginner
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
German Center for Open Source AI
Pairwise Causal Discovery Algorithms in pgmpy
30%
This project adds pairwise causal discovery methods to pgmpy, focusing on inferring causal direction between two variables from observational data. It includes implementations of ANM, IGCI, and Bivariate LiNGAM under a simple, unified interface, along with an HSIC-based independence test and basic benchmarking using the Tübingen CauseEffectPairs.

PyTorch
beginner
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
UC OSPO
Environmental NeTworked Sensor I: Customizable dashboard, layouts, equations, export, registry.
30%
This project makes the ENTS (DirtViz) dashboard easier to grow with real field use. A lot of the UI is still wired together by hand in React, which gets painful when new sensors show up or when people want different views of the same data. The plan is to expose what can actually be plotted using live database information, mainly from the sensor table, so the app lists available sensor names, measurements, and units per cell instead of maintaining long static lists in the frontend. Power and TEROS data may still live on older storage paths for a while, so the catalog will need a clear, documented way to bridge those sources until everything lines up on one model. The headline user feature is a drag and drop dashboard: reorder panels, add or remove them, and keep layout in the URL so someone can share a view with a link. Saving layouts on the server can come later, once the client side layout behavior is solid and easy to reason about. For people comparing multiple cells, the work should also make loads feel snappier by avoiding strictly one after another requests where batching or parallel loads make sense, and by ignoring out of date responses when the selection or date range changes mid flight. After that foundation, there is room for equations for derived metrics with tight server side validation, plus CSV export of what is already on screen. Fancy per panel styling is a lower priority and might stay minimal. Overall this is steady refactoring of the existing Flask and React stack, not a from scratch rewrite, so current APIs stay stable unless an extension is clearly worth it.

PyTorch
beginner
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
Kubeflow
Kubeflow SDK/SparkClient - Batch Jobs, Observability & Production Readiness
30%
The current Kubeflow SparkClient (KEP-107) provides a solid foundation for running interactive Spark workloads on Kubernetes, but it is still missing key capabilities required for real-world usage, such as batch job submission, consistent job lifecycle management, and production-level observability. This project focuses on extending the SparkClient to support complete, production-ready Spark workflows. The primary goal is to implement a robust submit_job() API for batch job execution using the SparkApplication CRD, supporting both script-based and function-based workloads. Alongside this, I will design a consistent set of lifecycle APIs such as job listing, status tracking, log retrieval, and cleanup, ensuring they align with existing Kubeflow SDK patterns. To improve usability in production environments, the project will also introduce observability features, including metrics collection from the Spark REST API, structured event tracking, and basic health monitoring. These additions will help users better understand job execution, debug failures, and monitor resource usage. The implementation will build on the current architecture without breaking compatibility, focusing on reliability, validation, and consistency. The final outcome will be a more complete and production-ready SparkClient that enables users to run, monitor, and manage Spark workloads on Kubernetes in a simple and consistent way.

TensorFlow
beginner
💡 "Matched 1 of your skills. Good difficulty level."

View Full Project Details
Start New Match