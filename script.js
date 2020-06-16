var form = document.getElementById('inputForm');
var text = document.getElementById('inputText');
var errorEl = document.getElementById('error');
var nameEl = document.getElementById('name');
var iconEl = document.getElementById('icon');
var onlineEl = document.getElementById('online');
var membersEl = document.getElementById('members');
var invitedByEl = document.getElementById('invitedby');

function url(code) {
    return 'https://discord.com/api/v6/invites/' + code + '?with_counts=true';
}

function getCode(input) {
    try {
        var url = new URL(input);
        if (url.host == "discord.gg") return url.pathname.split('/')[1];
        if (url.host == "discord.com" || url.host == "discordapp.com") return url.pathname.split('/')[2];
        return false;
    } catch (e) {
        return input;
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    var code = getCode(text.value);
    if (!code) {
        errorEl.innerHTML = 'Invalid input';
        return;
    }
    var xhr = new XMLHttpRequest;
    xhr.open('GET', url(code));
    xhr.addEventListener('load', (e) => {
        try {
            var json = JSON.parse(xhr.responseText);
            const members = json.approximate_member_count;
            const online = json.approximate_presence_count;
            const code = json.code;
            const name = json.guild.name;
            const id = json.guild.id;
            const icon = "https://cdn.discordapp.com/icons/" + id + '/' + json.guild.icon;
            errorEl.innerHTML = '';
            nameEl.setAttribute('href', 'https://discord.gg/' + code);
            nameEl.innerHTML = name + " (" + id + ")";
            iconEl.setAttribute('src', icon);
            onlineEl.innerHTML = online + ' online';
            membersEl.innerHTML = members + ' members';
            if (json.inviter) {
                const username = json.inviter.username;
                const tag = json.inviter.discriminator;
                const inviterId = json.inviter.id;
                invitedByEl.innerHTML = "Invited by @" + username + "#" + tag + " (" + inviterId + ")"
            } else {
                invitedByEl.innerHTML = ""
            }
        } catch (e) {
            console.log(e);
            errorEl.innerHTML = 'Invite not found';
            return;
        }
    })
    xhr.send();
})