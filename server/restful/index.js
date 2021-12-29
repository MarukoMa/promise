const koa = require('koa')
const app = new koa()
const koaRouter = require('koa-router')
const routerKoaCors = require('../koaCors')
const router = new koaRouter()
const BodyParser = require('koa-bodyparser');
const bodyparser= new BodyParser();
const listData = require('../mock/lists.json')

app.use(routerKoaCors())
app.use(bodyparser); 
app.use(router.routes());   /*启动路由*/
app.use(router.allowedMethods());

// 查询数据
router.get('/users/:id',ctx => {
    let resData = {
      code:"0000",
      data:{},
      total:0,
      msg:"success"
    }
    const {id}= ctx.params;
    if(id){
        resData.data = listData.find(item => item.id == id);
    }else{
        resData = {
            code:"9999",
            msg:"参数错误"
        }
    }
    ctx.body = JSON.stringify(resData)
})
//post 新增数据
router.post('/users',ctx => {
  let resData = {
    code:"0000",
    msg:"新增成功"
  }
  const {name,idNumber} = ctx.request.body;
  if(name && idNumber){
      listData.push({
        id:listData.length + 1,
        name,
        idNumber
      })
  }else{
      resData = {
          code:"0001",
          msg:"新增失败"
      }
  }
  ctx.body = JSON.stringify(resData)
})
//修改信息 //users/:id
router.put('/users/:id', (ctx) => {
  let resData = {
    code:"0000",
    msg:"修改成功"
  }
  const { id } = ctx.params;
  const { name,idNumber} = ctx.request.body;
  let user = listData.find(item => item.id == id);
  if (user) {
      user.name = name;
      user.idNumber = idNumber;
  }else{
    resData = {
      code:"0001",
      msg:"修改失败"
    }
  }
  ctx.body = JSON.stringify(resData);
})

// 删除数据
router.delete('/users/:id', (ctx) => {
  let resData = {
    code:"0000",
    msg:"删除成功"
  }
    const { id } = ctx.params
    if(id){
      listData.filter(item => item.id != ctx.params.id);
    }else{
      resData = {
        code:"0001",
        msg:"删除失败"
      }
    }
    ctx.body = JSON.stringify(resData);
})
app.listen(4000,()=>{
  console.log('http://localhost:4000')
})