const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contribo';

const OFFICIAL_ESOC_ORGS_AND_PROJECTS = [
  {
    org: {
      name: 'European Space Agency (ESA ACT)',
      slug: 'esa-act',
      description: 'The Advanced Concepts Team (ACT) is the European Space Agency research group exploring futuristic space technologies, orbital mechanics, and bio-inspired AI.',
      websiteUrl: 'https://www.esa.int/gsp/ACT',
      logoUrl: 'https://cdn.simpleicons.org/nasa', // Space agency fallback
      category: 'Aerospace & Space Exploration',
      technologies: ['python', 'c++', 'openmp', 'numpy', 'scipy', 'cuda'],
      topics: ['space', 'orbital-mechanics', 'astrodynamics', 'ai-optimization'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'PyGMO Parallel Global Multi-Objective Optimization Engine',
        description: 'Implement distributed asynchronous island-model genetic algorithms and GPU-accelerated gradient descent for interplanetary trajectory design.',
        difficulty: 'Advanced',
        techStack: ['python', 'c++', 'cuda', 'openmp'],
        githubUrl: 'https://github.com/esa/pygmo2',
        stars: 1200,
        mentors: ['Dr. Dario Izzo', 'Marcus Märtens'],
        topics: ['optimization', 'astrodynamics', 'space', 'c++'],
        year: 2026,
      },
      {
        title: 'KepTool Spacecraft Orbital Mechanics Visualizer & Solver',
        description: 'Build an interactive 3D WebGL orbital transfer trajectory tool for computing Hohmann and bi-elliptic transfer orbit energy profiles.',
        difficulty: 'Intermediate',
        techStack: ['python', 'typescript', 'three.js', 'webgl'],
        githubUrl: 'https://github.com/esa/pykep',
        stars: 890,
        mentors: ['Francesco Biscani', 'Moritz von Looz'],
        topics: ['astronomy', 'orbital-mechanics', 'webgl'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'CERN (European Org for Nuclear Research)',
      slug: 'cern-esoc',
      description: 'CERN is the European laboratory for particle physics, operating the Large Hadron Collider and creating foundational open-source scientific analysis software.',
      websiteUrl: 'https://home.cern',
      logoUrl: 'https://cdn.simpleicons.org/cplusplus',
      category: 'High-Energy Physics & Scientific Computing',
      technologies: ['c++', 'python', 'root', 'jupyter', 'cmake'],
      topics: ['physics', 'particle-physics', 'scientific-computing', 'data-analysis'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'ROOT Data Analysis High-Throughput RDataFrame GPU Kernels',
        description: 'Vectorize columnar particle collision telemetry filtering pipelines to achieve 100GB/sec processing on modern multi-core NVMe hardware.',
        difficulty: 'Advanced',
        techStack: ['c++', 'python', 'cuda', 'root'],
        githubUrl: 'https://github.com/root-project/root',
        stars: 3200,
        mentors: ['Danilo Piparo', 'Enrico Guiraud'],
        topics: ['high-energy-physics', 'big-data', 'c++', 'gpu'],
        year: 2026,
      },
      {
        title: 'CernVM-FS Content-Addressed Distributed File System Cache',
        description: 'Optimize peer-to-peer micro-chunk distribution for petabyte-scale scientific application software repositories.',
        difficulty: 'Intermediate',
        techStack: ['c++', 'python', 'linux', 'fuse'],
        githubUrl: 'https://github.com/cvmfs/cvmfs',
        stars: 650,
        mentors: ['Jakob Blomer', 'Valentin Volkl'],
        topics: ['distributed-systems', 'storage', 'linux'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Libre Space Foundation',
      slug: 'libre-space',
      description: 'Libre Space Foundation develops open-source hardware and software space technologies including the SatNOGS global satellite tracking network.',
      websiteUrl: 'https://libre.space',
      logoUrl: 'https://cdn.simpleicons.org/gnuradio',
      category: 'Space & Satellite Ground Stations',
      technologies: ['python', 'c++', 'gnuradio', 'django', 'c', 'sdr'],
      topics: ['satellite', 'radio', 'satnogs', 'space-telemetry'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'SatNOGS Software Defined Radio (SDR) Signal Decoder Pipeline',
        description: 'Implement automated demodulation routines in GNU Radio for CubeSat telemetry downlinks in UHF and S-band frequencies.',
        difficulty: 'Intermediate',
        techStack: ['python', 'c++', 'gnuradio', 'sdr'],
        githubUrl: 'https://gitlab.com/librespacefoundation/satnogs/satnogs-client',
        stars: 820,
        mentors: ['Manolis Surligas', 'Pierros Papadeas'],
        topics: ['satellite', 'gnuradio', 'sdr', 'telemetry'],
        year: 2026,
      },
      {
        title: 'Polaris AI Satellite Telemetry Anomaly Detection Engine',
        description: 'Apply unsupervised machine learning models to detect power degradation and temperature anomalies across orbiting open satellites.',
        difficulty: 'Advanced',
        techStack: ['python', 'pytorch', 'scikit-learn', 'fastapi'],
        githubUrl: 'https://gitlab.com/librespacefoundation/polaris/polaris',
        stars: 450,
        mentors: ['Vassilis Tsiligiannis', 'Apostolos Spanakis'],
        topics: ['satellite', 'anomaly-detection', 'machine-learning'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'CNES / CS Group (Orekit)',
      slug: 'orekit-cnes',
      description: 'Orekit is an accurate, efficient, and open-source low-level space flight dynamics library used by space agencies and satellite operators worldwide.',
      websiteUrl: 'https://www.orekit.org',
      logoUrl: 'https://cdn.simpleicons.org/openjdk',
      category: 'Flight Dynamics & Astrodynamics',
      technologies: ['java', 'python', 'c++', 'maven'],
      topics: ['astrodynamics', 'satellites', 'navigation', 'space-flight'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Orekit Relativistic Frame Corrections & Solar Radiation Pressure Estimator',
        description: 'Add general relativistic acceleration perturbations and non-spherical solar radiation pressure drag models for deep space probes.',
        difficulty: 'Advanced',
        techStack: ['java', 'python', 'mathematics'],
        githubUrl: 'https://gitlab.orekit.org/orekit/orekit',
        stars: 760,
        mentors: ['Luc Maisonobe', 'Bryan Cazabonne'],
        topics: ['astrodynamics', 'flight-dynamics', 'space'],
        year: 2026,
      },
      {
        title: 'Orekit Python Wrapper Autodoc & NumPy Vectorization Suite',
        description: 'Automate CPython JCC bridge binding generation for zero-copy NumPy array operations during orbital propagation sweeps.',
        difficulty: 'Intermediate',
        techStack: ['python', 'c++', 'java'],
        githubUrl: 'https://gitlab.orekit.org/orekit/orekit-python-wrapper',
        stars: 380,
        mentors: ['Petrus Hyvönen'],
        topics: ['python', 'bindings', 'astrodynamics'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Stellarium Astronomy Project',
      slug: 'stellarium',
      description: 'Stellarium is an open-source planetarium that shows a realistic 3D sky in real time with constellations, planets, and deep-sky objects.',
      websiteUrl: 'https://stellarium.org',
      logoUrl: 'https://cdn.simpleicons.org/opengl',
      category: 'Astronomy & 3D Visualization',
      technologies: ['c++', 'qt', 'opengl', 'glsl', 'cmake'],
      topics: ['astronomy', '3d-graphics', 'opengl', 'planetarium'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Stellarium PBR Planetary Atmosphere & Volumetric Cloud Rendering',
        description: 'Implement physically based atmospheric scattering and dynamic planetary shadow cascades using modern OpenGL core profile shaders.',
        difficulty: 'Advanced',
        techStack: ['c++', 'opengl', 'glsl', 'qt'],
        githubUrl: 'https://github.com/Stellarium/stellarium',
        stars: 6800,
        mentors: ['Alexander Wolf', 'Georg Zotti'],
        topics: ['opengl', 'shaders', 'astronomy', 'graphics'],
        year: 2026,
      },
      {
        title: 'Stellarium Telescope INDI / ASCOM Driver Automation Plugin',
        description: 'Create an automated plate-solving and telescope sync interface for amateur astrophotography tracking rigs.',
        difficulty: 'Intermediate',
        techStack: ['c++', 'qt', 'indi'],
        githubUrl: 'https://github.com/Stellarium/stellarium',
        stars: 6800,
        mentors: ['Fabien Chéreau'],
        topics: ['astrophotography', 'telescope', 'hardware'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'European Southern Observatory (ESO)',
      slug: 'eso-astronomy',
      description: 'ESO operates the world most advanced ground-based astronomical telescopes including the Very Large Telescope (VLT) and ALMA in the Atacama desert.',
      websiteUrl: 'https://www.eso.org',
      logoUrl: 'https://cdn.simpleicons.org/astropy',
      category: 'Observational Astrophysics',
      technologies: ['c', 'c++', 'python', 'astropy', 'qt'],
      topics: ['astronomy', 'image-processing', 'spectroscopy', 'vlt'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'ESO Reflex Astronomical Data Pipeline Instrument Calibrator',
        description: 'Develop automated cosmic ray removal algorithms and wavelength calibration fits for high-resolution spectrograph imagery.',
        difficulty: 'Advanced',
        techStack: ['python', 'c++', 'astropy', 'numpy'],
        githubUrl: 'https://github.com/eso/esoreflex',
        stars: 340,
        mentors: ['Pascal Ballester', 'Michele Neeser'],
        topics: ['astrophysics', 'spectroscopy', 'image-processing'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'German Aerospace Center (DLR SUMO)',
      slug: 'dlr-sumo',
      description: 'DLR is Germany national research center for aerospace and transport, authoring SUMO (Simulation of Urban Mobility) used globally for traffic simulations.',
      websiteUrl: 'https://www.dlr.de/en',
      logoUrl: 'https://cdn.simpleicons.org/cplusplus',
      category: 'Aerospace & Multi-Modal Simulation',
      technologies: ['c++', 'python', 'sumo', 'opengl', 'cmake'],
      topics: ['simulation', 'autonomous-vehicles', 'smart-cities', 'transport'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'SUMO Autonomous Vehicle Trajectory & V2X Mesh Protocol Simulation',
        description: 'Implement vehicle-to-everything (V2X) radio communication packet routing models for connected autonomous vehicle intersection negotiation.',
        difficulty: 'Advanced',
        techStack: ['c++', 'python', 'networking'],
        githubUrl: 'https://github.com/eclipse-sumo/sumo',
        stars: 2800,
        mentors: ['Jakob Erdmann', 'Michael Behrisch'],
        topics: ['autonomous-driving', 'simulation', 'c++'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'OpenSpace Astro-Visualizer',
      slug: 'openspace',
      description: 'OpenSpace is an open-source interactive data visualization software designed to visualize the entire known universe and space missions in real-time.',
      websiteUrl: 'https://www.openspaceproject.com',
      logoUrl: 'https://cdn.simpleicons.org/threejs',
      category: 'Space Exploration & Scientific Visualization',
      technologies: ['c++', 'opengl', 'lua', 'glsl', 'python'],
      topics: ['visualization', 'universe', 'space-missions', 'planetarium'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'OpenSpace Exoplanet Atmosphere Shader & Light Curve Simulator',
        description: 'Render transit light curves and transmission spectroscopy data for James Webb Space Telescope exoplanet observations in real time.',
        difficulty: 'Intermediate',
        techStack: ['c++', 'opengl', 'glsl', 'lua'],
        githubUrl: 'https://github.com/OpenSpace/OpenSpace',
        stars: 1500,
        mentors: ['Alexander Bock', 'Carter Emmart'],
        topics: ['astronomy', 'exoplanets', 'opengl', 'shaders'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Astropy European Project',
      slug: 'astropy-eu',
      description: 'The Astropy Project is a community effort to develop a single core package for astronomy in Python and foster interoperability between astronomy packages.',
      websiteUrl: 'https://www.astropy.org',
      logoUrl: 'https://cdn.simpleicons.org/python',
      category: 'Astronomy & Data Analysis',
      technologies: ['python', 'cython', 'c', 'numpy', 'scipy'],
      topics: ['astronomy', 'python', 'scientific-computing', 'coordinates'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Astropy Coordinates SkyCoord GPU Distance Vectorization',
        description: 'Optimize relativistic galactic coordinate transformations using vectorized C/Cython algorithms for billions of Gaia DR3 stellar survey catalogs.',
        difficulty: 'Advanced',
        techStack: ['python', 'cython', 'c', 'numpy'],
        githubUrl: 'https://github.com/astropy/astropy',
        stars: 4300,
        mentors: ['Erik Tollerud', 'Thomas Robitaille'],
        topics: ['astronomy', 'coordinates', 'performance'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Open Cosmos Space Missions',
      slug: 'open-cosmos',
      description: 'Open Cosmos manufactures and flies modular Earth Observation satellite constellations, providing open telemetry tools for nanosatellites.',
      websiteUrl: 'https://www.open-cosmos.com',
      logoUrl: 'https://cdn.simpleicons.org/satellite',
      category: 'Nanosatellites & Earth Observation',
      technologies: ['rust', 'c++', 'python', 'typescript'],
      topics: ['cubesat', 'earth-observation', 'satellites', 'telemetry'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'OpenComet Nano-Satellite Mission Orbit Simulation Suite',
        description: 'Develop a high-fidelity power budget and sun-pointing angle simulator for solar panel arrays in Low Earth Orbit (LEO).',
        difficulty: 'Intermediate',
        techStack: ['rust', 'typescript', 'webassembly'],
        githubUrl: 'https://github.com/opencosmos/opencomet-sim',
        stars: 310,
        mentors: ['Aleix Megías Homar', 'Jordi Barrera'],
        topics: ['cubesat', 'rust', 'simulation'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'INAF (Italian National Institute for Astrophysics)',
      slug: 'inaf-astro',
      description: 'INAF coordinates astronomical research in Italy across 20 research facilities, authoring open scientific data visualization tools for high-energy space missions.',
      websiteUrl: 'https://www.inaf.it',
      logoUrl: 'https://cdn.simpleicons.org/astropy',
      category: 'Astrophysics & Space Science',
      technologies: ['c++', 'vtk', 'python', 'opengl'],
      topics: ['astrophysics', 'visualization', 'space-telescopes', 'data-cube'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'VisIVO 3D Astrophysical Data Cube Direct Volume Renderer',
        description: 'Implement out-of-core Raymarching for rendering terabyte-scale radio astronomy HI spectral line cube cubes from the Square Kilometre Array (SKA).',
        difficulty: 'Advanced',
        techStack: ['c++', 'vtk', 'opengl', 'python'],
        githubUrl: 'https://github.com/inaf-visivo/visivo',
        stars: 280,
        mentors: ['Ugo Becciani', 'Eva Sciacca'],
        topics: ['astronomy', 'volume-rendering', 'visualization'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'EuroOSS Applied AI & Ethics Research Hub',
      slug: 'eurooss',
      description: 'EuroOSS is the collaborative European laboratory for trustworthy open-source software, ethical AI metrics, and EU AI Act compliance tools.',
      websiteUrl: 'https://eurooss.org',
      logoUrl: 'https://cdn.simpleicons.org/gnu',
      category: 'Applied AI & Open Source Systems',
      technologies: ['python', 'typescript', 'rust', 'pytorch', 'webassembly'],
      topics: ['applied-ai', 'ai-ethics', 'eu-ai-act', 'webassembly'],
      years: [2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Applied AI Ethics & EU AI Act Compliance Sandbox',
        description: 'Create an open benchmark suite for evaluating LLM outputs against algorithmic bias, fairness, and transparency metrics mandated by the EU AI Act.',
        difficulty: 'Intermediate',
        techStack: ['python', 'typescript', 'react', 'fastapi'],
        githubUrl: 'https://github.com/eurooss/ethics-sandbox',
        stars: 1450,
        mentors: ['Dr. Sofia Rossi', 'Lars van der Meer'],
        topics: ['ai-ethics', 'bias-detection', 'eu-ai-act'],
        year: 2026,
      },
      {
        title: 'Rust WebAssembly Audio Synthesizer & Signal Workbench',
        description: 'Build a low-latency collaborative audio editing and signal analysis tool compiled to WebAssembly for execution in browser engines.',
        difficulty: 'Advanced',
        techStack: ['rust', 'webassembly', 'javascript'],
        githubUrl: 'https://github.com/eurooss/wasm-synth',
        stars: 980,
        mentors: ['Jean-Pierre Cloutier'],
        topics: ['audio', 'webassembly', 'rust'],
        year: 2026,
      }
    ]
  }
];

async function seedEsocOrgs() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB at', MONGODB_URI);
    const db = client.db();

    const programsCol = db.collection('programs');
    const orgsCol = db.collection('organizations');
    const projectsCol = db.collection('projects');

    let program = await programsCol.findOne({ slug: 'esoc' });
    if (!program) {
      console.log('Creating esoc program...');
      const insertRes = await programsCol.insertOne({
        name: 'European Summer of Code (ESoC)',
        slug: 'esoc',
        organizer: 'European Space & Open Source Community',
        accentColor: '#1A56DB',
        officialWebsite: 'https://www.esoc.dev',
        category: 'Summer of Code',
        difficulty: 'Intermediate',
        eligibilitySummary: 'Global open source contributors and students interested in European open science & space projects',
        stipendSummary: '€3,000 – €6,000 paid open-source development stipends',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      program = await programsCol.findOne({ _id: insertRes.insertedId });
    }

    const programId = program._id;
    console.log('Using ESoC Program ID:', programId);

    let seededOrgs = 0;
    let seededProjects = 0;

    for (const item of OFFICIAL_ESOC_ORGS_AND_PROJECTS) {
      const orgData = {
        ...item.org,
        programId: programId,
        programSlug: 'esoc',
        updatedAt: new Date(),
      };

      const existingOrg = await orgsCol.findOne({ slug: orgData.slug });
      let orgId;

      if (existingOrg) {
        await orgsCol.updateOne({ _id: existingOrg._id }, { $set: orgData });
        orgId = existingOrg._id;
        console.log(`Updated organization: ${orgData.name}`);
      } else {
        orgData.createdAt = new Date();
        const res = await orgsCol.insertOne(orgData);
        orgId = res.insertedId;
        console.log(`Inserted organization: ${orgData.name}`);
      }
      seededOrgs++;

      // Seed projects
      for (const proj of item.projects) {
        const projectData = {
          ...proj,
          org: orgData.name,
          orgSlug: orgData.slug,
          orgLogoUrl: orgData.logoUrl,
          orgWebsiteUrl: orgData.websiteUrl,
          programId: programId,
          programSlug: 'esoc',
          programName: 'European Summer of Code (ESoC)',
          programColor: '#1A56DB',
          status: 'active',
          updatedAt: new Date(),
        };

        const existingProject = await projectsCol.findOne({
          title: projectData.title,
          orgSlug: orgData.slug,
        });

        if (existingProject) {
          await projectsCol.updateOne(
            { _id: existingProject._id },
            { $set: projectData }
          );
        } else {
          projectData.createdAt = new Date();
          await projectsCol.insertOne(projectData);
        }
        seededProjects++;
      }
    }

    console.log(`\n Successfully seeded ${seededOrgs} Official ESoC Organizations and ${seededProjects} ESoC Projects!`);
  } catch (err) {
    console.error('Error seeding ESoC data:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedEsocOrgs();
