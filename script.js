"use strict";

const KEYS = ["NOP", "AJMP", "LJMP", "RR", "INC", "JBC", "ACALL", "LCALL", "RRC", "DEC", "JB", "RET", "RL", "ADD", "JNB", "RETI", "RLC", "ADDC", "JC", "ORL", "JNC", "ANL", "JZ", "XRL", "JNZ", "JMP", "MOV", "SJMP", "MOVC", "DIV", "SUBB", "MUL", "CPL", "CJNE", "PUSH", "CLR", "SWAP", "XCH", "POP", "SETB", "DA", "DJNZ", "XCHD", "MOVX", "ORG", "END", "DSEG", "CSEG", "R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "@R0", "@R1", "A", "B", "C", "D"];
const OPERATORS = ["NOP", "AJMP", "LJMP", "RR", "INC", "JBC", "ACALL", "LCALL", "RRC", "DEC", "JB", "RET", "RL", "ADD", "JNB", "RETI", "RLC", "ADDC", "JC", "ORL", "JNC", "ANL", "JZ", "XRL", "JNZ", "JMP", "MOV", "SJMP", "MOVC", "DIV", "SUBB", "MUL", "CPL", "CJNE", "PUSH", "CLR", "SWAP", "XCH", "POP", "SETB", "DA", "DJNZ", "XCHD", "MOVX", "ORG", "END"];
const FLAGS = ["ORG", "END", "DSEG", "CSEG"];

const REGEX_KEYS = new RegExp(`(^|\\s)(${KEYS.join("|")})(,|\\s|$)`, "ig");
const REGEX_FLAGS = new RegExp(`(^|\\s)${FLAGS.join("|")}(\\s|$)`, "ig");
const REGEX_OPERATOR = new RegExp(`(^|\\s)${FLAGS.join("|")}(\\s|$)`, "ig");

// TAGNM:  OPERT OPND1, OPND2, OPND3  ; COMMENT 

function formatLine(line) {

    let res = () => [flag, oper, oprn1, oprn2, oprn3, comment];
    let flag = "",
        oper = "",
        oprn1 = "",
        oprn2 = "",
        oprn3 = "",
        comment = "";

    line = line.trim();
    if (line == "") return res();

    // Comment
    let iCom = line.indexOf(";");
    if (iCom !== -1) {
        comment = line.substring(iCom + 1).trim();
        line = line.substring(0, iCom).trim();
    }

    // To uppercase and other formats
    line = line.replace(REGEX_KEYS, (m, $1, $2, $3) => $1 + $2.toUpperCase() + $3);
    line = line.replace(/\s+,/g, ",");
    line = line.replace(/\s+:/g, ":");

    // Sensitive flags
    if (line.match(new RegExp(`^(${FLAGS.join("|")})`, "i"))) {
        flag = line.replace(/\s{2+}/g, " ");
        return res();
    }
    // Other flags
    let iColon = line.indexOf(":");
    if (iColon != -1) {
        flag = line.substring(0, iColon + 1).replace(/\s+/g, "");
        line = line.substring(iColon + 1).trim();
    }

    let words = line.split(/\s+/);
    switch (words.length) {
        case 2: oper = words[0]; oprn1 = words[1]; break;
        case 3: oper = words[0]; oprn1 = words[1]; oprn2 = words[2]; break;
        case 4: oper = words[0]; oprn1 = words[1]; oprn2 = words[2]; oper3 = words[3]; break;
        default: comment = line.trim() + " " + comment; comment = comment.trim(); return res();
    }

    // Replace xxH to XXh
    oprn1 = oprn1.replace(/([0-9a-f]+)H/i, (m, $1) => $1.toUpperCase() + "h");
    oprn2 = oprn2.replace(/([0-9a-f]+)H/i, (m, $1) => $1.toUpperCase() + "h");
    oprn3 = oprn3.replace(/([0-9a-f]+)H/i, (m, $1) => $1.toUpperCase() + "h");

    return res();
}

function formatText(text) {
    let hasEmptyline = true;
    let lines = text.split("\n");
    let res = "";

    function isEmpty(arr) {
        return arr[0] === ""
            && arr[1] === ""
            && arr[2] === ""
            && arr[3] === ""
            && arr[4] === ""
    }

    function dealline(arr) {
        if (isEmpty(arr)) {
            if (!arr[5]) { hasEmptyline = true; res += "\n"; return; }
            if (!hasEmptyline) res += "        ";
            res += "; " + arr[5] + "\n";
            return;
        }
        res += arr[0].padEnd(8);
        res += arr[1].padEnd(6);
        res += arr[2].padEnd(6);
        res += arr[3].padEnd(6);
        res += arr[4].padEnd(7);
        if (arr[5]) res += "; " + arr[5];
        res = res.trim() + "\n";
        hasEmptyline = false;
    }

    let proarrs = lines.map(formatLine);
    for (let i = 0; i < proarrs.length; i++) {
        let po = proarrs[i];
        if (po[0].endsWith(":") && po[1] === "" && po[5] === "" && i < proarrs.length - 1) {
            let pon = proarrs[i + 1];
            if (pon[0] === "" && (pon[1] !== "" || pon[5] !== "")) {
                po[1] = pon[1];
                po[2] = pon[2];
                po[3] = pon[3];
                po[4] = pon[4];
                po[5] = pon[5];
                i++;
                dealline(["", "", "", "", "", ""]);
            }
        }
        dealline(po);
    }

    // Clear empty head and tail;
    res = res.replace(/(^\n+)|(\n+$)/g, "");
    res = res.replace(/\n{3+}/g, "\n\n");
    return res + "\n";
}

const $textarea = $("textarea"), $button = $("button");
$button.click(function () {
    let text = $textarea.val();
    if (text === "") return;
    $textarea.val(formatText(text));
});