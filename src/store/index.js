import { createStore } from 'vuex'
import user from './modules/user'
import dashBoard from './modules/dashBoard'

const store = createStore({
  modules: {
    user,
    dashBoard
  }
})

export default store
