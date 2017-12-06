const { fork, tootWith, preHook, execute } = require('appache/effects')
const composeHelp = require('./help')
const parseArgs = require('./parseArgs')
const modifySchema = require('./modifySchema')
const { print, handleResult, handleError } = require('./handling')


module.exports = function* cli() {
  yield preHook({
    event: 'schematize',
    tags: ['modifyCommandSchema', 'modifyOptionSchema'],
  }, (schema) => {
    schema = modifySchema(schema)
    return [schema]
  })

  yield preHook({
    event: 'activate',
    tags: ['interface'],
  }, function* (config) {
    yield fork('async', function* () {
      let args = process.argv.slice(2)

      try {
        let batch = parseArgs(args, config)
        let result = yield yield execute(batch)
        handleResult(result, config)
      } catch (err) {
        yield tootWith('error', (config, err, event) => {
          return handleError(err, config, event)
        }, err)
      }
    })
  })
}

module.exports.composeHelp = composeHelp
module.exports.print = print
module.exports.handleResult = handleResult
module.exports.handleError = handleError
module.exports.interface = ['cli']
module.exports.tags = ['interface', 'cli']
