const koa = require('koa')
const app = new koa()
const koaRouter = require('koa-router')
const router = new koaRouter({prefix:"/users"}) //注册地址 '/'相当于’/users‘
const listData = require('../mock/lists.json')
const logger = require('koa-logger');

app.use(logger());  //查看日志
app.use(router.routes());   /*启动路由*/
app.use(router.allowedMethods());

router.get('/list',ctx => {
    let jsonpStr = ''
    const callbackName = ctx.query.callback || "callback"
    const pageSize = Number(ctx.query.pageSize)   //每页展示条数
    const currentPage =Number(ctx.query.currentPage)  //当前请求页数
    let resData = {
        code:"0000",
        data:[],
        total:0,
        msg:"success"
    }
    if(pageSize && currentPage){
        resData.total = listData.length
        resData.data = listData.slice(pageSize * (currentPage-1),pageSize * currentPage)
    }else{
        resData = {
            code:"9999",
            msg:"参数错误"
        }
    }
    jsonpStr =`${callbackName}(${JSON.stringify(resData)})`
    ctx.set( 'Content-Type', 'text/json');
    ctx.body = jsonpStr
})
app.listen(2000,()=>{
    console.log('http://localhost:2000')
})