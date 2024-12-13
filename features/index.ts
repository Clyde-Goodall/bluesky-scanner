export function printer(msg: string, type?: string) {
    if(msg.length <= 0 || msg == null) return;
    switch(type) {
        case "heading":
            console.log('▒'.repeat(10) + `[[ ${msg.toUpperCase()} ]]` + '▒'.repeat(10));
            return
        case "body":
            console.log(`◾ ${msg}`);
            return
        default:
            console.log(`◾ ${msg}`);
            return
    }
}