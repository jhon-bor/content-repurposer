const PROJECT_ID = '40037155-92b4-47e2-81b8-872602963593';
const ENVIRONMENT_ID = 'c53184f8-f512-4439-a801-677c20554e40';
const SERVICE_ID = '24667aca-5ec6-4816-aeca-f1be4ba6906b';
const ACCESS_TOKEN = 'X_DGXKyucoKOscfPMyypzVKIgA4zzz4U5VcoY164gNd';

async function railwayRequest(query, variables = {}) {
  const response = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    },
    body: JSON.stringify({ query, variables })
  });
  
  const json = await response.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

async function main() {
  console.log('🚀 Railway 部署工具\n');
  
  try {
    console.log('📋 步骤 1: 验证 token 并获取项目信息...');
    const projectResult = await railwayRequest(`
      query getProject($id: String!) {
        project(id: $id) {
          id
          name
        }
      }
    `, { id: PROJECT_ID });
    
    console.log(`✅ 项目: ${projectResult.project.name}`);
    
    console.log('\n📦 步骤 2: 获取最新部署...');
    const deploymentsResult = await railwayRequest(`
      query deployments($projectId: String!, $environmentId: String!) {
        deployments(projectId: $projectId, environmentId: $environmentId, first: 5) {
          edges {
            node {
              id
              status
              createdAt
            }
          }
        }
      }
    `, { projectId: PROJECT_ID, environmentId: ENVIRONMENT_ID });
    
    const deployments = deploymentsResult.deployments.edges;
    console.log(`最近 ${deployments.length} 个部署:`);
    deployments.forEach((d, i) => {
      console.log(`  ${i+1}. ${d.node.status} - ${new Date(d.node.createdAt).toLocaleString()}`);
    });
    
    const latestId = deployments[0].node.id;
    
    console.log('\n🔄 步骤 3: 触发重新部署...');
    try {
      const redeployResult = await railwayRequest(`
        mutation redeployDeployment($id: String!) {
          redeployDeployment(id: $id) {
            id
            status
          }
        }
      `, { id: latestId });
      
      console.log(`✅ 重新部署已触发!`);
      console.log(`   新部署 ID: ${redeployResult.redeployDeployment.id}`);
      console.log(`   状态: ${redeployResult.redeployDeployment.status}`);
      
      const newDeploymentId = redeployResult.redeployDeployment.id;
      
      console.log('\n⏳ 步骤 4: 等待部署完成 (预计 2-3 分钟)...');
      
      let status = redeployResult.redeployDeployment.status;
      let attempts = 0;
      const maxAttempts = 60;
      
      while ((status === 'BUILDING' || status === 'QUEUED' || status === 'INITIALIZING') && attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000));
        attempts++;
        
        try {
          const statusResult = await railwayRequest(`
            query getDeployment($id: String!) {
              deployment(id: $id) {
                id
                status
                createdAt
              }
            }
          `, { id: newDeploymentId });
          
          status = statusResult.deployment.status;
          console.log(`   [${attempts}/${maxAttempts}] 状态: ${status}`);
          
          if (status === 'SUCCESS') {
            console.log('\n🎉 部署成功!');
            break;
          } else if (status === 'FAILED' || status === 'CRASHED' || status === 'REMOVED') {
            console.log('\n❌ 部署失败!');
            break;
          }
        } catch (e) {
          console.log(`   查询状态出错: ${e.message.substring(0, 50)}`);
        }
      }
      
    } catch (e) {
      console.log('redeployDeployment 不可用，尝试其他方式...');
      console.log('错误:', e.message.substring(0, 100));
    }
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  }
}

main();
