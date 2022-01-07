const form = document.getElementById('inputForm');
const text = document.getElementById('inputText');
const errorEl = document.getElementById('error');
const nameEl = document.getElementById('name');
const iconEl = document.getElementById('icon');
const onlineEl = document.getElementById('online');
const membersEl = document.getElementById('members');
const invitedByEl = document.getElementById('invitedby');

let currentQuery = '';
let lastFetched = 0;

function getCode(input) {
	input = input.replace(/^https?:\/\//, '');
	let ggMatch = /^discord\.gg\/([\w-]+)$/i.exec(input);
	if (ggMatch) return ggMatch[1];
	let comMatch = /^(?:discord|discordapp)\.com\/invite\/([\w-]+)$/i.exec(
		input,
	);
	if (comMatch) return comMatch[1];

	if (/^([\w-]+)$/.test(input)) return input;
	return null;
}

form.addEventListener('submit', async e => {
	e.preventDefault();
	let invite = getCode(text.value.trim());
	if (currentQuery == invite && Date.now() - lastFetched < 1000 * 10) return;
	if (!invite) {
		errorEl.innerHTML = text.value.trim() ? 'Invalid input' : '';
		clear();
		return;
	}

	try {
		currentQuery = invite;
		lastFetched = Date.now();
		let res = await fetch(
			`https://discord.com/api/v6/invites/${invite}?with_counts=true`,
		);
		if (!res.ok) {
			errorEl.innerHTML =
				res.status == 404
					? 'Unknown invite'
					: `Something went wrong: ${res.status} ${res.statusText}`;
			clear();
			return;
		}
		let json = await res.json();
		const members = json.approximate_member_count;
		const online = json.approximate_presence_count;
		const code = json.code;
		const name = json.guild.name;
		const id = json.guild.id;
		const icon = `https://cdn.discordapp.com/icons/${id}/${json.guild.icon}`;
		errorEl.innerHTML = '';
		nameEl.setAttribute('href', `https://discord.gg/${code}`);
		nameEl.innerHTML = `${name} (${id})`;
		iconEl.setAttribute('src', icon);
		onlineEl.innerHTML = `${online} online`;
		membersEl.innerHTML = `${members} members`;
		if (json.inviter) {
			const username = json.inviter.username;
			const tag = json.inviter.discriminator;
			const inviterId = json.inviter.id;
			invitedByEl.innerHTML = `Invited by @${username}#${tag} (${inviterId})`;
		} else {
			invitedByEl.innerHTML = '';
		}
	} catch (e) {
		console.log(e);
		errorEl.innerHTML = 'Something went wrong';
		clear();
		return;
	}
});

function clear() {
	nameEl.innerHTML = '';
	iconEl.removeAttribute('src', '');
	onlineEl.innerHTML = '';
	membersEl.innerHTML = '';
	invitedByEl.innerHTML = '';
}
