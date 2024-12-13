export function printer(msg: string, type?: string) {
    if(typeof msg == "string" && msg.length == 0 || msg == null) return;
    switch(type) {
        case "heading":
            console.log('▒'.repeat(15) + `[[ ${msg.toUpperCase()} ]]` + '▒'.repeat(15));
            return
        case "body":
            console.log(`◾ ${msg}`);
            return
        default:
            console.log(`◾ ${msg}`);
            return
    }
}