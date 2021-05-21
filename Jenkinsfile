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

//        stage('Deploy') {
//            boolean isDeploy = JOB_NAME.endsWith('deploy')
//            if (isDeploy) {
//                sh 'npm ci'
//                sshagent (credentials: ['deploy-dev']) {
//                    sh 'ssh -o StrictHostKeyChecking=no user@localhost rm test-jenkins/ -rf || true'
//                    sh 'ssh -o StrictHostKeyChecking=no user@localhost mkdir test-jenkins'
//                    sh 'scp -o StrictHostKeyChecking=no -r ./* user@localhost:test-jenkins'
//                }
//                echo "Finished deploying"
//            }
//        }

    }
    catch (java.lang.Throwable err) {
        currentBuild.result = "FAILURE"
        boolean isDeploy = JOB_NAME.endsWith('deploy')
        if (isDeploy) {
            echo "Error during deployment: ${err.getMessage()}"
            // 'set +x' and 'set -x' hides curl command line with credentials in jenkins logs!
            //log = sh(script: "set +x; curl -s -S --stderr - --user ${API_USER}:${API_PASSWORD} ${BUILD_URL}consoleText; set -x", returnStdout: true)
            //log = currentBuild.rawBuild.getLog(1000).join('\n')
            //echo "Log: ${log}"

            //def logText = readFile file: 'package-lock.json'

            def logLinesLimit = 50 // 200
            def logLengthLimit = 7000
            def logLines = currentBuild.rawBuild.getLog(logLinesLimit)
            def logAddLineIdx = logLines.size()
            def logLenSum = 0
            while (logAddLineIdx > 0) {
                def lenAdd = logLines[logAddLineIdx - 1].length() + 1
                if ((logLenSum + lenAdd) > logLengthLimit) {
                    break
                }
                logLenSum += lenAdd
                logAddLineIdx -= 1
            }
            echo "logAddLineIdx ${logAddLineIdx}"
            def logEnd = logLines.size() - 1
            echo "logEnd ${logEnd}"
            echo "logSize ${logLines.size()}"
            def logText = logLines[logAddLineIdx..logEnd].join('\n')
            if (logAddLineIdx > 0) {
                logText = '...\n' + logText
            }
            def attachments = [
                [
                    text: "```${logText}```",
                    fallback: 'Log content',
                    color: '#ff0000'
                ]
            ]
            slackSend channel: '#testing-jenkins-integration', color: '#ff0000',
                    message: "cushion_rest: Last log lines for the '${env.BRANCH_NAME}' branch:",
                    attachments: attachments
        }
        throw err
    }
    finally {
    }
}
