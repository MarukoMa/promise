
function Promise(fn) {
    let _this = this
    _this.promiseState = "pending"; //状态
    _this.promiseResult = null //结果保存
    _this.callbackFun = []  //异步回调函数保存
    function resolve(val) {
        //Promise的状态一旦发生改变，则不能在修改
        if(_this.promiseState !== 'pending') return
        //修改对象状态
        _this.promiseState = "resolved"
        //设置对象结果
        _this.promiseResult = val
        //调用成功回调
        _this.callbackFun.forEach(item => {
            item.onResolve(val)
        })
    }
    function reject(val) {
        if(_this.promiseState !== 'pending') return
        _this.promiseState = "rejected"
        _this.promiseResult = val
        _this.callbackFun.forEach(item => {
            item.onRejected(val)
        })
    }
    //执行捕获异常
    try{
        fn(resolve, reject)
    }catch(e) {
        reject(e)
    }
    
}

Promise.prototype.then = function (onResolve,onRejected) {
    let _this = this
    return new Promise((resolve, reject) => {
        //回调方法封装
        function callback(StateType){
            try{
                //获取回调函数的结果
                let result = StateType(_this.promiseResult)
                if(result instanceof Promise){
                    result.then((val)=>{
                        resolve(val)
                    },(err)=>{
                        reject(err)
                    })
                }else{
                    //结果的对象状态为成功 
                    resolve(result)
                }
            }catch(e){
                reject(e)
            }
        }
        //成功回调
        if(_this.promiseState === 'resolved'){
            callback(onResolve)
        }
        //失败回调
        if(_this.promiseState === 'rejected'){
            callback(onRejected)
        }
        //保存回调函数
        if(_this.promiseState === 'pending'){
            _this.callbackFun.push({
                onResolve:function(){
                    callback(onResolve)
                },
                onRejected:function(){
                    callback(onRejected)
                }
            })
        }
    })
   
}
