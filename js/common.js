const jsonTextData = {
    "tos": `
<h1><strong>Terms of Service</strong></h1>
<p><em>Last Updated: 30 March, 2025</em>  </p>
<p></p>
<p>By accessing or using any tools, code, or resources (&quot;Tools&quot;) provided on this GitHub page (&quot;Page&quot;), you agree to comply with and be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Tools.  </p>
<h3 id="-1-no-warranty-"><strong>1. No Warranty</strong></h3>
<p>The Tools are provided <strong>&quot;AS IS&quot;</strong> without warranties of any kind, express or implied. The owner of this Page makes <strong>no guarantees</strong> regarding:  </p>
<ul>
<li>Functionality, accuracy, or reliability of the Tools.  </li>
<li>Continued availability or maintenance of the Tools.  </li>
<li>Suitability for any particular purpose.  </li>
</ul>
<h3 id="-2-no-liability-"><strong>2. No Liability</strong></h3>
<p>You assume <strong>all risks</strong> associated with the use of the Tools. The owner of this Page is <strong>not responsible</strong> for:  </p>
<ul>
<li>Any direct, indirect, incidental, or consequential damages arising from the use of the Tools.  </li>
<li>Any harm, loss, or disruption caused by the Tools, including but not limited to data loss, system failures, or security breaches.  </li>
</ul>
<h3 id="-3-no-data-collection-"><strong>3. No Data Collection</strong></h3>
<p>The Tools do <strong>not</strong> intentionally collect, store, or transmit any personal or usage data. However, third-party platforms (e.g., GitHub, Tampermonkey) may have their own data policies.  </p>
<h3 id="-4-modifications-termination-"><strong>4. Modifications &amp; Termination</strong></h3>
<p>The owner reserves the right to:  </p>
<ul>
<li>Modify, discontinue, or remove any Tool at any time without notice.  </li>
<li>Update these Terms at any time. Your continued use constitutes acceptance of changes.  </li>
</ul>
<h3 id="-5-third-party-dependencies-"><strong>5. Third-Party Dependencies</strong></h3>
<p>Some Tools may rely on external libraries, APIs, or services. You are responsible for complying with their respective terms and policies.  </p>
<h3 id="-6-acceptable-use-"><strong>6. Acceptable Use</strong></h3>
<p>You agree <strong>not</strong> to use the Tools for:  </p>
<ul>
<li>Illegal, harmful, or abusive purposes.  </li>
<li>Violating others’ rights (e.g., privacy, intellectual property).  </li>
</ul>
<h3 id="-7-no-support-obligation-"><strong>7. No Support Obligation</strong></h3>
<p>The owner is <strong>not obligated</strong> to provide support, updates, or fixes for the Tools.  </p>
`,

"cookie-policy": `
<h1 id="-cookie-policy-"><strong>Cookie Policy</strong></h1>
<p><em>Last Updated: 30 March, 2025</em>  </p>
<h3 id="-1-no-tracking-or-identification-"><strong>1. No Tracking or Identification</strong></h3>
<p>This GitHub page (&quot;Page&quot;) and its Tools <strong>do not</strong> use cookies or other tracking technologies for:  </p>
<ul>
<li>User identification.  </li>
<li>Analytics or advertising.  </li>
<li>Data collection of any kind.  </li>
</ul>
<h3 id="-2-localstorage-for-theme-preferences-"><strong>2. localStorage for Theme Preferences</strong></h3>
<p>The Page may use <strong>localStorage</strong> (a browser storage mechanism) <strong>only</strong> to retain your preference for light/dark mode. This data:  </p>
<ul>
<li>Is stored locally on your device (not transmitted to any server).  </li>
<li>Can be cleared by deleting browser storage for this site.  </li>
</ul>
<h3 id="-3-third-party-services-"><strong>3. Third-Party Services</strong></h3>
<p>GitHub (as the host platform) may use cookies for functionality, security, or analytics. Refer to GitHub’s Privacy Statement for details.  </p>
<h3 id="-4-your-control-"><strong>4. Your Control</strong></h3>
<p>You can disable or clear localStorage via your browser settings.  </p>

`,
"discord-link": `
<h1 id="-discord-link-"><strong>Discord Username</strong></h1>
<p><em>Last Updated: 30 March, 2025</em>  </p>
<h3>My discord username is:</h3>
<h2>banned_account</h2>
<p>PS: The account is not actually banned or deleted, those are just my usernames (: The account is active even if it appears to be deleted.</p>
`
}



document.querySelector("#terms-of-service").addEventListener('click', function (event) {
    event.preventDefault();
    showPopup("Terms of Service", jsonTextData["tos"]);
});
document.querySelector("#cookie-policy").addEventListener('click', function (event) {
    event.preventDefault();
    showPopup("Cookie Policy", jsonTextData["cookie-policy"]);
});
document.querySelector("#discord-link").addEventListener('click', function (event) {
    event.preventDefault();
    showPopup("Discord Link", jsonTextData["discord-link"]);
});

function showPopup(header, text) {
    if (!document.querySelector('.popup')) {
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.innerHTML = `
                <div class="popup-header">
                    <h3>${header}</h3>
                    <button class="close-btn"> X</button>
                </div>
                <div class="popup-content">
                    ${text}
                </div>
            `;
        popup.querySelector('.close-btn').addEventListener('click', function () {
            popup.remove();
        });
        const closeOnEscape = function(e) {
            console.log("Escape Key listener")
            if (e.key === 'Escape') {
                popup.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
        document.body.appendChild(popup);
    }
}