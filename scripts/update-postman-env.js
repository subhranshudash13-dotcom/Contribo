/* eslint-disable */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

function updatePostmanFiles() {
  console.log('Synchronizing API keys into Postman collection and environment files...');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const geminiApiKey = process.env.GEMINI_API_KEY || '';
  const openaiApiKey = process.env.OPENAI_API_KEY || '';
  const aiProvider = process.env.AI_PROVIDER || 'gemini';
  const githubClientId = process.env.AUTH_GITHUB_ID || '';
  const googleClientId = process.env.AUTH_GOOGLE_ID || '';

  const scratchCollectionPath = path.join(__dirname, '..', 'scratch', 'postman_collection.json');
  const publicCollectionPath = path.join(__dirname, '..', 'public', 'postman_collection.json');
  const scratchEnvPath = path.join(__dirname, '..', 'scratch', 'postman_environment.json');
  const publicEnvPath = path.join(__dirname, '..', 'public', 'postman_environment.json');

  let collection = {};
  if (fs.existsSync(scratchCollectionPath)) {
    try {
      collection = JSON.parse(fs.readFileSync(scratchCollectionPath, 'utf8'));
    } catch (err) {
      console.error('Error parsing scratch postman collection:', err.message);
    }
  }

  // Update variables in collection
  const variables = [
    { key: 'baseUrl', value: baseUrl, description: 'Base URL for Contribo API' },
    { key: 'geminiApiKey', value: geminiApiKey, description: 'Gemini AI API Key' },
    { key: 'openaiApiKey', value: openaiApiKey, description: 'OpenAI API Key' },
    { key: 'aiProvider', value: aiProvider, description: 'Active AI Provider' },
    { key: 'sessionToken', value: 'YOUR_AUTHJS_SESSION_TOKEN_HERE', description: 'Session token from NextAuth cookie' },
    { key: 'githubClientId', value: githubClientId, description: 'GitHub OAuth Client ID' },
    { key: 'googleClientId', value: googleClientId, description: 'Google OAuth Client ID' },
    { key: 'programSlug', value: 'gsoc', description: 'Slug for dynamic program endpoints' },
    { key: 'projectId', value: '65b53e8d246c4f001f35832a', description: 'Sample Project ID' },
    { key: 'orgSlug', value: 'apache', description: 'Sample Organization Slug' },
  ];

  collection.info = collection.info || {
    name: 'Contribo API',
    description: 'API Collection for Contribo — Open Source Program Matcher & Hub.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  };

  collection.variable = variables;

  // Save collection to scratch and public
  const collectionJson = JSON.stringify(collection, null, 2);
  fs.writeFileSync(scratchCollectionPath, collectionJson, 'utf8');
  fs.mkdirSync(path.join(__dirname, '..', 'public'), { recursive: true });
  fs.writeFileSync(publicCollectionPath, collectionJson, 'utf8');
  console.log(`✓ Updated Postman collection saved to:\n  - ${scratchCollectionPath}\n  - ${publicCollectionPath}`);

  // Generate Postman Environment file
  const postmanEnv = {
    id: 'contribo-local-env',
    name: 'Contribo Environment (Local)',
    values: [
      { key: 'baseUrl', value: baseUrl, enabled: true },
      { key: 'geminiApiKey', value: geminiApiKey, enabled: true },
      { key: 'openaiApiKey', value: openaiApiKey, enabled: true },
      { key: 'aiProvider', value: aiProvider, enabled: true },
      { key: 'githubClientId', value: githubClientId, enabled: true },
      { key: 'googleClientId', value: googleClientId, enabled: true },
      { key: 'sessionToken', value: 'YOUR_AUTHJS_SESSION_TOKEN_HERE', enabled: true },
    ],
    _postman_variable_scope: 'environment',
  };

  const envJson = JSON.stringify(postmanEnv, null, 2);
  fs.writeFileSync(scratchEnvPath, envJson, 'utf8');
  fs.writeFileSync(publicEnvPath, envJson, 'utf8');
  console.log(`✓ Postman environment file saved to:\n  - ${scratchEnvPath}\n  - ${publicEnvPath}`);
}

updatePostmanFiles();
