
function Promise(fn) {
    // 定义Promise的三种状态
    const PENDING = 'PENDING'
    const RESOLVEG = 'RESOLVEG'
    const REJECTED = 'REJECTED'
    this.promiseState = PENDING; //状态
    this.promiseResult = null //结果保存
    this.callbackFun = []  //异步回调函数保存
    const resolve = (val) => {
        //Promise的状态一旦发生改变，则不能在修改
        if(this.promiseState !== PENDING) return
        //修改对象状态
        this.promiseState = RESOLVEG
        //设置对象结果
        this.promiseResult = val
        //异步任务成功回调,保证多个then同时回调
        this.callbackFun.forEach(item => {
            item.onResolved(val)
        })
    }
    const  reject = (val) => {
        if(this.promiseState !== PENDING) return
        this.promiseState = REJECTED
        this.promiseResult = val
        this.callbackFun.forEach(item => {
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

/**
 * [注册fulfilled/resolved状态/rejected状态对应的回调函数]
 * @param  {function} onResolved fulfilled状态时 执行的函数
 * @param  {function} onRejected  rejected状态时 执行的函数
*/
Promise.prototype = {
    then: function (onResolved, onRejected) {
        return new Promise((resolve, reject) => {
            //回调方法封装
            const  callback = (stateType) => {
                try{
                    //获取回调函数的结果
                    let result = stateType(this.promiseResult)
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
            if(this.promiseState ===  "RESOLVEG"){
                callback(onResolved)
            }
            //失败回调
            if(this.promiseState === "REJECTED"){
                callback(onRejected)
            }
            //保存回调函数
            if(this.promiseState === "PENDING"){
                this.callbackFun.push({
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
/*
 * Promise.all Promise进行并行处理
 * 参数: promises对象组成的数组作为参数
 * 返回值: 返回一个Promise实例
 * 当这个数组里的所有promise对象全部变为resolve状态的时候，才会resolve。
*/
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
/*
 * Promise.race
 * 参数: 接收 promises对象组成的数组作为参数
 * 返回值: 返回一个Promise实例
 * 只要有一个promise对象进入 FulFilled 或者 Rejected 状态的话，就会继续进行后面的处理(取决于哪一个更快)
 */
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