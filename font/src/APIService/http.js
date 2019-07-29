
import Http from 'axios'
if (process.env.NODE_ENV === 'production') {
  Http.defaults.baseURL = '/'
} else {
  Http.defaults.baseURL = '/'
}
Http.defaults.timeout = 30000

// 请求类
class ApiService {
  constructor () {
    this.interceptorsOfReq()
    this.interceptorsOfRes()
  }

  get (url, params = {}) {
    if (params) {
      return Http.get(url, {
        params
      }).then(res => res.data)
    }
    return Http.get(url).then(res => res.data)
  }

  post (url, bodyParams = {}, params = {}, config = {}) {
    if (Object.keys(params).length > 0) {
      for (let key in params) {
        url += `&${key}=${params[key]}`
      }
    }
    if (Object.keys(config).length > 0) {
      return Http.post(url, bodyParams, config).then(res => res.data)
    }
    return Http.post(url, bodyParams).then(res => res.data)
  }

  interceptorsOfReq () {
    return Http.interceptors.request.use(
      config => {
        let token = ''
        if (token) {
          config.headers['token'] = token
        }
        return config
      },
      err => {
        return Promise.reject(err)
      })
  }

  interceptorsOfRes () {
    Http.interceptors.response.use(function (response) {
      let res = response.data

      if (res.code === 200 || res.code === 0) {
        return response
      }
    }, function (error) {
      return Promise.reject(error)
    })
  }
}

// 导出一个对象
export default new ApiService()
