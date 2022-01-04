
function Promise(fn) {
    const _this = this
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
        //异步任务成功回调,保证多个then同时回调
        _this.callbackFun.forEach(item => {
            item.onResolved(val)
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
Promise.prototype = {
    then: function (onResolved, onRejected) {
        const _this = this
        return new Promise((resolve, reject) => {
            //回调方法封装
            function callback(stateType){
                try{
                    //获取回调函数的结果
                    let result = stateType(_this.promiseResult)
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
                callback(onResolved)
            }
            //失败回调
            if(_this.promiseState === 'rejected'){
                callback(onRejected)
            }
            //保存回调函数
            if(_this.promiseState === 'pending'){
                _this.callbackFun.push({
                    onResolved:function(){
                        callback(onResolved)
                    },
                    onRejected:function(){
                        callback(onRejected)
                    }
                })
            }
        })
       
    },
    catch: function(onRejected) {
        return this.then(undefined,onRejected)
    }
}

// 定义resolve方法
Promise.resolve = function(value){
    return new Promise((resolve,reject)=>{
        if(value instanceof Promise){
            value.then(val => {
                resolve(val);
            },err => {
                reject(err);
            })
        }else{
            resolve(value);
        }
    })
}
// 定义reject方法
Promise.reject = function(reason){
    return new Promise((resolve,reject)=>{
        reject(reason)
    })
}

// 定义all()方法
Promise.all = function(promises){
    return new Promise((resolve,reject)=>{
        // 记录数组中成功状态Promise的个数
        let count = 0;
        // 保存成功的状态值
        let successArr = [];
        for(let i=0;i<promises.length;i++){
            promises[i].then(value => {
                count++;
                successArr[i]=value;
                // 如果成功的个数等于数组长度，则说明每个都成功
                if(count === promises.length){
                    resolve(successArr);
                }
            },err => {
                reject(err);
            })
        };
    })
}
// 定义race()方法
Promise.race = function(promises){
    return new Promise((resolve,reject)=>{
        for(let i=0;i<promises.length;i++){
            promises[i].then(value => {
                resolve(value);
            },err => {
                reject(err);
            })
        }
    })
}