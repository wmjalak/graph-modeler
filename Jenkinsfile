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
        stage('Build') {
            agent {
                docker {
                    image 'node:12.9.0-alpine'
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
