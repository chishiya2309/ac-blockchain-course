# Security policy

Report suspected vulnerabilities privately using the repository's GitHub **Security > Report a vulnerability**
feature when it is enabled. If unavailable, ask the maintainers for a private reporting channel without
posting exploit details in a public issue. Never include private keys, RPC credentials or wallet seed phrases.

Include the affected version, a minimal local reproduction, impact and suggested remediation.
Maintainers should triage privately, prepare a fix and coordinate disclosure before publishing exploit details.

This template is an educational starting point. Review and test changes to contract logic and deployment
parameters for your own application before deploying. CI exercises local networks; it does not certify a
public deployment or constitute a security audit.

Use dedicated deployment wallets, encrypted keystore values, reviewed dependencies and preserved public
deployment journals. Keep environment files out of source control.
