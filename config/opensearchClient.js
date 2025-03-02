const { Client } = require("@opensearch-project/opensearch");
const AWS = require("aws-sdk");
const createAwsOpensearchConnector = require("aws-opensearch-connector");

// Configure AWS SDK with IAM credentials
const awsConfig = new AWS.Config({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const opensearchClient = new Client({
  node: "https://vpc-mydailydilli-2utwiovpbawnw5tmwtkj25l3hu.us-east-1.es.amazonaws.com",
  ...createAwsOpensearchConnector(awsConfig), // AWS Signature V4 authentication
});

module.exports = opensearchClient;
