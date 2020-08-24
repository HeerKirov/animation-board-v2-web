# Animation Board v2 Web
动画数据库 & 观看记录与个人评价 & 行为统计项目 (前端部分)

旧的[Animation Board](https://github.com/HeerKirov/AnimationBoard-Web)项目的重构项目。根据重构的新后端设计重构，并切换至Vue-CLI以及Vue3构建。

## Technology Stack
* TypeScript
* Pug
* Vue3(router, cli)
* Fomantic-UI
* Chart.js

## Build
### Setup
```bash
npm install
```
### Development
```bash
npm run serve
```
### Compile
```bash
npm run build
```

### Configuration
项目的核心参数写在`.env`中。可将其复制为`.env.development.local`和`.env.production.local`创建开发和编译环境。
`.env`的核心参数:
```
# 备案号
VUE_APP_CASE_NUMBER=京ICP备12345678号
# 备案号链接
VUE_APP_CASE_URL=http://www.beian.miit.gov.cn
# app在local storage中存储的数据的前缀
VUE_APP_STORAGE_PREFIX=animation-board-v2
# app申请token时的默认时长(ms)
VUE_APP_TOKEN_EFFECTIVE=604800000
# app经过多长时间后申请刷新token(ms)
VUE_APP_TOKEN_UPDATE_INTERVAL=86400000
# 后端API地址
VUE_APP_SERVER_URL=http://localhost:8000
# BS服务地址
VUE_APP_BASIC_SERVICE_URL=http://basic-service
```
