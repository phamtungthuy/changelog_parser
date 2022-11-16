var linkApi;
document.querySelector(".btn").onclick = () => {
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


function display(releases) {
    var releaseList = [];
    for (let i = 0; i < releases.length - 1; i++) {
        console.log(linkApi + '/compare/' + releases[i + 1].version + '...' + releases[i].version);
        releaseList.push({
            compare: linkApi + '/compare/' + releases[i + 1].version + '...' + releases[i].version,
            version: releases[i].version,
            changeLog: releases[i].changeLog
        });
    }
    Promise.all(releaseList.map(async(release, idx) => {
            var htmls = [`<div class ="row">${release.version}<table class="table table-striped table-dark ">
            <thead>
                <tr>
                    <th scope="col">commits</th>
                    <th scope="col">changelog</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>
            <table class="table table-striped table-dark ">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">title</th>
                <th scope="col">message</th>
              </tr>
            </thead>
            <tbody>`];

            var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            await htmls.push(await Promise.all(arr.map(idx => {
                console.log(`${release.compare}?page=${idx}`);
                return fetch(`${release.compare}?page=${idx}`, obj)
                    .then(res => res.json())
                    .then(content => {
                        try {
                            console.log(content);
                            let id = 0;
                            return content.commits.map(commit => {
                                var messageArray = commit.commit.message.trim().split('\n');
                                var title = messageArray[0];
                                var body = messageArray.slice(1, messageArray.length).join('\n');
                                return `<tr>
                                        <th scope="row">${++id}<br>
                                        <a href=${commit.url} class="com-url-api" target="_blank">Commit API</a>
                                        <a href=${commit.html_url} class="com-url-html" target="_blank">Commit Page</a>
                                        </th>
                                        <td>${title}</td>
                                        <td>${body}</td>
                                        </tr>`;
                            }).join('');
                        } catch (e) {
                            console.log(e);
                            return '';
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        return '';
                    })
            })));
            htmls.push(`</tbody></table></td><td>${release.changeLog.split('\n').join('<br>')}</td></tr></tbody></table></div>`)
                //htmls.push(`</tbody></table><div style="float:left">${release.changeLog.split('\n').join('<br>')}</div></div>`);
            return htmls;
        }))
        .then(arr => {
            console.log(arr.join(''))
            document.querySelector('#releases').innerHTML = arr.join('');
            document.querySelectorAll('#releases > div > table').forEach((table, idx) => {
                table.onclick = () => {
                    let body = document.querySelector(`#releases div:nth-child(${idx + 1}) table tbody`)
                    if (body.style.display === 'none' || body.style.display == '') {
                        body.style.display = 'table-row-group';
                    } else {
                        body.style.display = 'none';
                    }
                }
            });
        })
        .catch((htmls) => {
            console.log(htmls.join(''))
            document.querySelector('#releases').innerHTML = htmls.join('');
            document.querySelectorAll('#releases > div > table').forEach((table, idx) => {
                table.onclick = () => {
                    let body = document.querySelector(`#releases div:nth-child(${idx + 1}) table tbody`)
                    if (body.style.display === 'none' || body.style.display == '') {
                        body.style.display = 'table-row-group';
                    } else {
                        body.style.display = 'none';
                    }
                }
            });
        })
};
