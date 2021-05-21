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

            def commitHash = sh(script: "git rev-parse HEAD", returnStdout: true).trim()
            echo "commitHash ${commitHash}"
            def prId = sh(script: "git ls-remote origin 'pull/*/head' | grep -F ${commitHash} | awk -F'/' '{print \$3}'", returnStdout: true).trim()
            echo "prId ${prId}"


            def logLinesLimit = 200
            def logLengthLimit = 7000 // Limit log length here to prevent truncating it by Slack
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
            def logEnd = logLines.size() - 1
            def logText = logLines[logAddLineIdx..logEnd].join('\n')
            if (logAddLineIdx > 0) {
                logText = "[...truncated ${logAddLineIdx} lines...]\n${logText}"
            }

            def attachments = [
                [
                    text: "```${logText}```",
                    fallback: 'Log content',
                    color: '#ff0000'
                ]
            ]
            slackSend channel: '#testing-jenkins-integration', color: '#ff0000',
                    message: "Job ${env.JOB_NAME} build ${env.BUILD_DISPLAY_NAME}: Last log lines for the '${env.BRANCH_NAME}' branch:",
                    attachments: attachments
        }
        throw err
    }
    finally {
    }
}
