import store from '../store'

export const auth = async (params) => {
  const { runWorkToken } = params
  let res = store.dispatch('getTokenCode', {
    code: runWorkToken
  })
  return res
}
