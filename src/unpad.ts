export function unpad(str: string): string {
    const offset = str.match(/ +/g)![0].length;
    let padding = "\n";
    for (let i = 0; i < offset; i++) {
        padding = padding + " ";
    }
    return str.split(padding).join("\n");
}
