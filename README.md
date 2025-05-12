## 注意事项
请使用yarn，如果您使用`npm install`来安装依赖，有可能导致运行错误。
如遇上述情况可以删除 `node_modules`文件夹，再运行 `yarn`
## 安装 pnpm

npm i yarn -g

## 安装所有依赖

yarn

## 本地测试

yarn run dev

## 打包 uat

yarn build:uat

## 发布

yarn build

## 执行组件库测试

yarn  test

## 查看整体项目情况

vue ui


## 链接到本地私服
### 设置npm源地址
<!-- npm config set registry http://10.72.47.10:8081/repository/crland-group/ -->
npm config set registry http://maven.saas.crland.com.cn/nexus/repository/npm-group/

### 登录私服npm
<!-- npm login -registry=http://10.72.47.10:8081/repository/crland/ -->
npm login -registry=http://maven.saas.crland.com.cn/nexus/repository/npm-crland-ued/
