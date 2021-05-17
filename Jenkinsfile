#!groovy

// https://github.com/jenkinsci/pipeline-examples/blob/master/jenkinsfile-examples/nodejs-build-test-deploy-docker-notify/Jenkinsfile
// Note: this is a *scripted* pipeline, not declarative
node('node') {

    currentBuild.result = "SUCCESS"

    try {

        stage('Checkout') {
            boolean isDeploy = JOB_NAME.endsWith('deploy')
            if (isDeploy) {
                echo "Started deploying"
            }
            checkout scm
        }

//        stage ('Checkstyle ts, styles, prettier') {
//            try {
//                sh 'npm ci'
//                sh 'npm run lint'
//                sh 'npm run lint-styles'
//                sh 'npm run format'
//                sh 'npm run check-ts'
//            } catch (err) {
//                echo 'Linting failed'
//                throw err
//            }
//        }

        stage('Test') {
            env.NODE_ENV = "test"
            env.PORT = 5001
            print "Environment will be : ${env.NODE_ENV}"
            print "Node version:"
            sh 'node -v'
            sh 'npm ci'
            sh 'npm test'
        }

        stage('Cleanup') {
            echo 'prune and cleanup'
            sh 'rm node_modules/ -rf'
        }

        stage('Deploy') {
            boolean isDeploy = JOB_NAME.endsWith('deploy')
            if (isDeploy) {
                sh 'npm ci'
                sshagent (credentials: ['deploy-dev']) {
                    sh 'ssh -o StrictHostKeyChecking=no user@localhost rm test-jenkins/ -rf || true'
                    sh 'ssh -o StrictHostKeyChecking=no user@localhost mkdir test-jenkins'
                    sh 'scp -o StrictHostKeyChecking=no -r ./* user@localhost:test-jenkins'
                }
                echo "Finished deploying"
            }
        }

    }
    catch (java.lang.Throwable err) {
        currentBuild.result = "FAILURE"
        boolean isDeploy = JOB_NAME.endsWith('deploy')
        if (isDeploy) {
            echo "Error during deployment: ${err.getMessage()}"
            // 'set +x' and 'set -x' hides curl command line with credentials in jenkins logs!
            //log = sh(script: "set +x; curl -s -S --stderr - --user readonly:11308a5f07f044c8795b953ad2d2f5f9a0 ${BUILD_URL}consoleText; set -x", returnStdout: true)
            log = currentBuild.rawBuild.getLog(1000)
            echo "Log: ${log}"
        }
        throw err
    }
    finally {
    }
}
