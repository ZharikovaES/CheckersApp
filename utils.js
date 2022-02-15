export function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
export function generateUUID() { // Public Domain/MIT
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
export function filterNoRepeatResult(arr){
    if (arr)
        return arr.filter((el, i, arr) => {
            let arrMap = arr.map(element => {
                return JSON.stringify(element)
            })
            let currentIndex = arrMap.indexOf(JSON.stringify(el));
            return currentIndex == i;
        });
    return arr;
}