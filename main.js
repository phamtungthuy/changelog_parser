var linkApi;
document.querySelector(".btn").onclick = () => {
    console.log("click!");
    handle(document.querySelector(".input-link").value);
}

var obj = {
    method: 'GET',
    headers: {
        Authorization: 'token ' + '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',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
};

async function handle(linkHtml) {
    linkApi = 'https://api.github.com/repos/' + linkHtml.split('github.com/')[1];
    var releases = [];
    var isFinal = false;
    for (let i = 1; i <= 10; i++) {
        if (isFinal) {
            break;
        }
        await fetch(`${linkApi}/releases?page=${i}`, obj)
            .then(res => res.json())
            .then(objArray => objArray.map(obj => {
                return {
                    version: obj.tag_name,
                    changeLog: obj.body
                };
            }))
            .then(arr => {
                if (arr.length == 0 || arr.length < 30) {
                    isFinal = true;
                }
                console.log(arr);
                releases.push(...arr);
            })
            .catch(err => console.log(err));
    }
    display(releases);
}

function isNumber(text) {
    for (var i = 0; i < text.length; i++) {
        if (text[i] >= '0' && text[i] <= '9') continue;
        return false;
    }
    return true;
}


function solve(text) {
    var strings = text.split('\n');
    var ans = '';
    var isBreak = false;
    strings.forEach(string => {
        if (isBreak) return;
        if (string.indexOf('Contributors') != -1 || string.indexOf('New Contributors') != -1) {
            isBreak = true;
            return;
        }
        let level = 0;
        while (string.indexOf('  ') == 0) {
            ++level;
            string = string.substring(2);
        }
        string = string.trim();
        if ((string.indexOf('##') == 0 || string.indexOf('#') == 0) && isNaN(string.substring(1, string.length))) {
            ans += `<h1>${string.substring(2)}</h1><br>`;
            return;
        }
        let line = `<span class="level${level}">`;
        if (string[0] == '+') {
            string = string.substring(1);
            if (level == 0) {
                string = '-' + string;
            } else if (level == 1) {
                string = '+' + string;
            } else if (level == 2) {
                string = '(-)' + string;
            } else {
                string = '(+)' + string;
            }
        }
        for (var i = 0; i < string.length;) {

            if (string[i] == '(' && string.indexOf('https://', i) == i + 1) {
                let index = string.indexOf(')', i);
                let url = string.substring(i + 1, index);
                line += `(<a href="${url}">${url}</a>)`;
                i = index + 1;
            } else if (string.indexOf('https://', i) == i) {
                let url = string.substring(i);
                let last = url.split('/').slice(-1);
                console.log(last[0] + " " + !isNaN(last[0]));
                if (last[0].trim() != '' && !isNaN(last[0])) {
                    line += `<a href="${url}">#${last[0]}</a>`
                } else {
                    line += `<a href="${url}">${url}</a>`;
                }
                i = string.length;
            } else if (string[i] == '[') {
                let lastIndex = string.indexOf(']', i);
                var firstElement = string.substring(i, lastIndex + 1);
                i = lastIndex + 1;
                if (string.indexOf('(https://', i) == i) {
                    var secondLastIndex = string.indexOf(')', i);
                    line += `<a href="${string.substring(i + 1, secondLastIndex)}">${firstElement.substring(1, firstElement.length - 1)}</a>`;
                    i = secondLastIndex + 1;
                } else {
                    line += firstElement;
                }
            } else if(string[i] == '#') {
                let index = string.indexOf(' ', i);
                if(index == -1) {
                    index = string.length;
                }
                let nString = '';
                if(index > i) {
                    nString = string.substring(i + 1, index);
                }
                if(nString != '' && !isNaN(nString)) {
                    line += `<a href="https://github.com/apache/echarts/issues/${nString}">#${nString} </a>`;
                    i = index;
                } else {
                    line += string[i];
                    ++i;
                }
            }else {
                line += string[i];
                ++i;
            }
        }
        line += '</span><br>';
        ans += line;
    });
    return ans;
}

async function handleText(text) {

    if (text.indexOf('---') != -1) {
        text = text.split('---');
        if (text.length == 2) {
            text = text[0];
        } else text = text[1];
    }
    text = await solve(text);
    return text;
}

async function display(releases) {
    var htmls = [`<table class="table table-striped table-dark">
    <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">version</th>
            <th scope="col">changelog</th>
        </tr>
    </thead>
    <tbody>`];
    for (let i = 0; i < releases.length; i++) {
        htmls.push(`<tr>
            <td>${i + 1}</td>
            <td>${releases[i].version}</td>
            <td>${await handleText(releases[i].changeLog)}</td>
        </tr>`)
    }
    htmls.push(`</tbody></table>`);
    document.querySelector('.content').innerHTML = htmls.join('');

};