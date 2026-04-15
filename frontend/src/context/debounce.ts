

export const Debounce = (callback, delay:number) => {
        let timer
        return (...args) => {
            clearTimeout(timer)
            timer =  setTimeout(()=>{
                callback.apply(this,args)
            },delay)
        }
}