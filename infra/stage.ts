export const isPermanentStage = ['dev', 'production'].includes($app.stage)

export const domain = (() => {
  if ($app.stage === 'production') return 'postfully.com'
  if ($app.stage === 'dev') return 'dev.postfully.com'
  return `${$app.stage}.dev.postfully.com`
})()

export const zoneID = '2652ed5a181250707e59550ac22c02df'
