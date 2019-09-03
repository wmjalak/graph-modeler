// Define the service names
def idmDemoServices = ["idm-graphmodeler"] as String[]

def BuildAndPushImage(String imageName) { 

	// Delete the existing source to ensure there is a clean pull
    dir ('WebApp') {
        unstash "DynamicFormSource"

        def app = docker.build("${imageName}", "-f Dockerfile .")
        docker.withRegistry('https://idaasidmacr.azurecr.io', 'ecs_azure_container_registry_credentials') {
            app.push("${env.BUILD_NUMBER}")
            app.push('latest')
        }
    }

    sh 'rm -rf WebApp'
}

def DeployKubernetesServices(String[] serviceNames, String cluster, String namespace) {
    
	def KUBECTLCMD = '/usr/local/bin/kubectl'
	def CONTAINERREGISTRY = 'idaasidmacr.azurecr.io'

	// Switch to the Kubernetes Cluster & Namespace
	sh "${KUBECTLCMD} config use-context ${cluster}"
	sh "${KUBECTLCMD} config set-context ${cluster} --namespace ${namespace}"
	sh "${KUBECTLCMD} get all"

	// Deploy the services
	serviceNames.each { serviceName ->
		sh "${KUBECTLCMD} set image deployment/${serviceName} ${serviceName}=${CONTAINERREGISTRY}/${serviceName}:$BUILD_NUMBER -n ${namespace}"
		sh "${KUBECTLCMD} rollout status deployment ${serviceName} -n ${namespace}"
	}
}

pipeline {
    agent none
    stages {
        stage ('Source') {
            agent { label "master" }
            steps {
                git branch: 'master', credentialsId: 'mmtfscredentials', url: 'http://141.192.206.35:8080/tfs/DefaultCollection/IDaaS.IdM.vNext/_git/GraphModeler'
                stash name: "Source"         
                sh 'hostname'
            }
        }
        stage('BuildSite') {
            agent { label "master" }
            steps {
                BuildAndPushImage("idm-graphmodeler")
            }
        }
        stage('DeploySite') {
            agent { label "master" }
            steps {
                DeployKubernetesServices(idmDemoServices, 'idm-aks-test', 'idm-demo')
            }
        }
        stage('BuildComponent') {
            agent {
                docker {
                    image 'node:12.9.1-alpine'
                    args '--tmpfs /.config -u root:root --privileged'
                }
            }
            steps {
                sh 'hostname'
                sh 'rm -rf *'
                unstash "Source"
                sh 'ls -la'
                sh 'npm install'
                sh 'ls -la'
                sh 'npm run package'
                sh 'ls -la'
                sh 'ls -la dist/graph-modeler'
                dir ('dist/graph-modeler') { 
                    stash includes: 'graph-modeler-*.tgz', name: 'component'
                }
            }
        }
        stage ('StoreComponent') {
            agent { label "master" }
            steps {
                dir ('component') {
                    sh 'rm -rf *'
                    unstash 'component'
                    sh 'ls -la'
                    sh 'cp graph-modeler-*.tgz /usr/share/nginx/html/components/graph-modeler-build-$BUILD_NUMBER.tgz'
                    sh 'mv graph-modeler-*.tgz /usr/share/nginx/html/components/graph-modeler-version-1.0.0.tgz'
                    sh 'ls -la /usr/share/nginx/html/components'
                }
            }
        }
    }
}
