var linkApi;
document.querySelector(".btn").onclick = () => {
    handle(document.querySelector(".input-link").value);
}

function handle(linkHtml) {
    linkApi = 'https://api.github.com/repos/' + linkHtml.split('github.com/')[1];;
    console.log(linkApi);
    fetch(linkApi + '/releases')
        .then(res => res.json())
        .then(objArray => objArray.map(obj => {
            return obj.tag_name;
        }))
        .then(display);
}

function display(releases) {
    var releaseList = [];
    for (let i = 0; i < releases.length - 1; i++) {
        releaseList.push({
            compare: linkApi + '/compare/' + releases[i + 1] + '...' + releases[i],
            version: releases[i]
        });
    }
    Promise.all(releaseList.map(release => {
            console.log(release.compare);
            return fetch(release.compare)
                .then(res => res.json())
                .then(content => {
                    let htmls = [`<ul class ="version"><span>${release.version}</span>`];
                    htmls.push(...content.commits.map(commit => {
                        return `<li>${commit.commit.message}</li>`;
                    }))
                    htmls.push(`</ul>`);
                    return htmls.join('');
                })
        }))
        .then(arr => {
            console.log(arr.join(''))
            document.querySelector('#releases').innerHTML = arr.join('');
            document.querySelectorAll('.version').forEach((element, idx) => {
                element.onclick = () => {
                    var liElements = document.querySelectorAll(`#releases .version:nth-child(${idx + 1}) li`);
                    liElements.forEach(li => {
                        if (li.style.display == 'none') {
                            li.style.display = 'block';
                        } else {
                            li.style.display = 'none';
                        }
                    })
                }

            })
        })
}