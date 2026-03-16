import type { CMMCDomain } from '@/types'

export type CardType = 'practice' | 'term' | 'acronym'

export interface Flashcard {
  id: string
  domain: CMMCDomain | 'CMMC'   // 'CMMC' for general framework cards
  cardType: CardType
  front: string
  back: string
  level?: 'L1' | 'L2' | 'L3'
}

export const SEED_FLASHCARDS: Flashcard[] = [

  // ─── Domain acronyms ────────────────────────────────────────────────────────

  {
    id: 'ac-acronym',
    domain: 'AC', cardType: 'acronym', front: 'AC',
    back: 'Access Control\n\nControls who can access systems and what they can do once inside. Covers user identification, least privilege, remote access, and external system connections.\n\n17 practices at L2 (3.1.1 – 3.1.22)',
  },
  {
    id: 'at-acronym',
    domain: 'AT', cardType: 'acronym', front: 'AT',
    back: 'Awareness and Training\n\nEnsures personnel understand security risks and responsibilities. Covers role-based training and insider threat awareness.\n\n3 practices at L2 (3.2.1 – 3.2.3)',
  },
  {
    id: 'au-acronym',
    domain: 'AU', cardType: 'acronym', front: 'AU',
    back: 'Audit and Accountability\n\nRequires creating, protecting, and reviewing audit logs. Enables detection of unauthorized activity and supports incident investigation.\n\n9 practices at L2 (3.3.1 – 3.3.9)',
  },
  {
    id: 'cm-acronym',
    domain: 'CM', cardType: 'acronym', front: 'CM',
    back: 'Configuration Management\n\nEstablishes and controls baseline configurations for systems. Covers change management, least functionality, and software restrictions.\n\n9 practices at L2 (3.4.1 – 3.4.9)',
  },
  {
    id: 'ia-acronym',
    domain: 'IA', cardType: 'acronym', front: 'IA',
    back: 'Identification and Authentication\n\nEnsures system users are who they claim to be. Covers password management, MFA, and identifier lifecycle.\n\n11 practices at L2 (3.5.1 – 3.5.11)',
  },
  {
    id: 'ir-acronym',
    domain: 'IR', cardType: 'acronym', front: 'IR',
    back: 'Incident Response\n\nRequires establishing and exercising an incident handling capability. Covers response, reporting, testing, and coordination with DoD.\n\n3 practices at L2 (3.6.1 – 3.6.3)',
  },
  {
    id: 'ma-acronym',
    domain: 'MA', cardType: 'acronym', front: 'MA',
    back: 'Maintenance\n\nControls who can maintain systems and how. Covers approved tools, remote maintenance security, and sanitization of maintenance equipment.\n\n6 practices at L2 (3.7.1 – 3.7.6)',
  },
  {
    id: 'mp-acronym',
    domain: 'MP', cardType: 'acronym', front: 'MP',
    back: 'Media Protection\n\nProtects system media (paper and digital) during storage, use, transport, and disposal. Covers sanitization per NIST SP 800-88.\n\n9 practices at L2 (3.8.1 – 3.8.9)',
  },
  {
    id: 'ps-acronym',
    domain: 'PS', cardType: 'acronym', front: 'PS',
    back: 'Personnel Security\n\nEnsures individuals with access to CUI systems are trustworthy. Covers screening, agreements, and termination/transfer procedures.\n\n2 practices at L2 (3.9.1 – 3.9.2)',
  },
  {
    id: 'pe-acronym',
    domain: 'PE', cardType: 'acronym', front: 'PE',
    back: 'Physical Protection\n\nLimits physical access to CUI systems and facilities. Covers visitor escorting, access logs, and equipment management.\n\n6 practices at L2 (3.10.1 – 3.10.6)',
  },
  {
    id: 'ra-acronym',
    domain: 'RA', cardType: 'acronym', front: 'RA',
    back: 'Risk Assessment\n\nRequires periodically assessing risk to operations, assets, and personnel. Covers vulnerability scanning and remediation.\n\n3 practices at L2 (3.11.1 – 3.11.3)',
  },
  {
    id: 'ca-acronym',
    domain: 'CA', cardType: 'acronym', front: 'CA',
    back: 'Security Assessment\n\nRequires regularly assessing security controls and maintaining an SSP and POA&M. This domain is weighted 3x for CCA assessors.\n\n4 practices at L2 (3.12.1 – 3.12.4)',
  },
  {
    id: 'sc-acronym',
    domain: 'SC', cardType: 'acronym', front: 'SC',
    back: 'System and Communications Protection\n\nProtects communications and enforces system boundaries. Covers encryption in transit, network segmentation, and shared resource isolation.\n\n16 practices at L2 (3.13.1 – 3.13.16)',
  },
  {
    id: 'si-acronym',
    domain: 'SI', cardType: 'acronym', front: 'SI',
    back: 'System and Information Integrity\n\nEnsures systems remain free from malicious code and are patched promptly. Covers malware protection, alerts, and security monitoring.\n\n7 practices at L2 (3.14.1 – 3.14.7)',
  },

  // ─── CMMC framework terms ────────────────────────────────────────────────────

  {
    id: 'term-cui',
    domain: 'CMMC', cardType: 'term', front: 'CUI',
    back: 'Controlled Unclassified Information\n\nInformation the government creates or possesses that requires safeguarding per law, regulation, or policy — but is not classified.\n\nExamples: export-controlled technical data, ITAR material, law enforcement sensitive, privacy data.\n\nCUI is the target asset that CMMC Level 2 and 3 protect.',
  },
  {
    id: 'term-fci',
    domain: 'CMMC', cardType: 'term', front: 'FCI',
    back: 'Federal Contract Information\n\nInformation provided by or generated for the government under a contract — not intended for public release.\n\nFCI is the target asset for CMMC Level 1 (FAR 52.204-21). FCI is a subset of sensitive information but distinct from CUI.',
  },
  {
    id: 'term-ssp',
    domain: 'CA', cardType: 'term', front: 'SSP',
    back: 'System Security Plan\n\nRequired by CA.L2-3.12.4. Documents:\n• System boundary and description\n• CUI categories and data flows\n• How each of the 110 practices is implemented\n• Connections to external systems\n\nMust be periodically updated — a stale SSP is a finding against 3.12.4.',
  },
  {
    id: 'term-poam',
    domain: 'CA', cardType: 'term', front: 'POA&M',
    back: 'Plan of Action and Milestones\n\nRequired by CA.L2-3.12.2. Documents:\n• Security deficiencies identified in assessments\n• The plan to remediate each deficiency\n• Responsible owner for each item\n• Target completion date\n\nA POA&M with no owners or timelines does not satisfy 3.12.2 — it must be an active remediation plan, not just a list.',
  },
  {
    id: 'term-c3pao',
    domain: 'CMMC', cardType: 'term', front: 'C3PAO',
    back: 'CMMC Third-Party Assessment Organization\n\nA Cyber AB-authorized organization that employs CCAs and conducts Level 2 and Level 3 CMMC assessments.\n\nC3PAOs must themselves be assessed and authorized by DIBCAC before they can certify contractors.',
  },
  {
    id: 'term-osc',
    domain: 'CMMC', cardType: 'term', front: 'OSC',
    back: 'Organization Seeking Certification\n\nThe DoD contractor being assessed for CMMC compliance. The OSC is responsible for:\n• Implementing all applicable practices\n• Maintaining the SSP and POA&M\n• Cooperating with C3PAO assessors during the assessment',
  },
  {
    id: 'term-dibcac',
    domain: 'CMMC', cardType: 'term', front: 'DIBCAC',
    back: 'Defense Industrial Base Cybersecurity Assessment Center\n\nA DCSA organization that:\n• Authorizes C3PAOs to conduct CMMC assessments\n• Conducts Level 3 assessments directly\n• Maintains the CMMC marketplace database\n• Issues CMMC certificates to contractors',
  },
  {
    id: 'term-nist-800-171',
    domain: 'CMMC', cardType: 'term', front: 'NIST SP 800-171',
    back: 'NIST Special Publication 800-171\n\n"Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations"\n\nThe source document for all 110 CMMC Level 2 practices across 14 domains.\n\nRevision 2 (2020) is the current version used for CMMC 2.0 Level 2 requirements.',
  },
  {
    id: 'term-far-52',
    domain: 'CMMC', cardType: 'term', front: 'FAR 52.204-21',
    back: 'Federal Acquisition Regulation clause 52.204-21\n\n"Basic Safeguarding of Covered Contractor Information Systems"\n\nThe source document for all 17 CMMC Level 1 practices. Applies to any contractor that processes or transmits FCI.\n\nSelf-attestation is sufficient for Level 1 — no third-party assessment required.',
  },
  {
    id: 'term-scoping',
    domain: 'CMMC', cardType: 'term', front: 'CUI Scoping',
    back: 'The process of identifying which systems, components, and people are in scope for CMMC assessment.\n\nScope is determined by where CUI is stored, processed, or transmitted.\n\nKey scoping asset categories:\n• CUI Assets (in scope)\n• Security Protection Assets (support CUI but don\'t process it)\n• Contractor Risk Managed Assets (out of scope with compensating controls)\n• Specialized Assets (IoT, OT, test equipment)',
  },

  // ─── L1 practice cards ───────────────────────────────────────────────────────

  {
    id: 'pr-ac-l1-3.1.1',
    domain: 'AC', cardType: 'practice', level: 'L1', front: 'AC.L1-3.1.1',
    back: 'Limit information system access to authorized users, processes acting on behalf of authorized users, and devices (including other information systems).\n\nAssessor lens: Shared accounts are an immediate finding. Every user must have a unique ID. Access lists must exist and be maintained.',
  },
  {
    id: 'pr-ac-l1-3.1.2',
    domain: 'AC', cardType: 'practice', level: 'L1', front: 'AC.L1-3.1.2',
    back: 'Limit information system access to the types of transactions and functions that authorized users are permitted to execute.\n\nPrinciple: Least privilege.\n\nAssessor lens: Users should have only what their role requires. Excessive access — especially write or delete on all systems — is a finding.',
  },
  {
    id: 'pr-ia-l1-3.5.1',
    domain: 'IA', cardType: 'practice', level: 'L1', front: 'IA.L1-3.5.1',
    back: 'Identify information system users, processes acting on behalf of users, and devices.\n\nAssessor lens: Every entity accessing the system must have a unique, traceable identifier. Anonymous or shared identifiers fail this practice.',
  },
  {
    id: 'pr-ia-l1-3.5.2',
    domain: 'IA', cardType: 'practice', level: 'L1', front: 'IA.L1-3.5.2',
    back: 'Authenticate (or verify) the identities of those users, processes, or devices, as a prerequisite to allowing access to organizational information systems.\n\nAssessor lens: Weak authentication (e.g., 4-char PIN) fails this. At L1, authentication must be meaningful — MFA is not required until L2.',
  },
  {
    id: 'pr-mp-l1-3.8.3',
    domain: 'MP', cardType: 'practice', level: 'L1', front: 'MP.L1-3.8.3',
    back: 'Sanitize or destroy information system media before disposal or reuse.\n\nStandard: NIST SP 800-88 (Clear / Purge / Destroy).\n\nAssessor lens: File deletion and formatting do NOT satisfy this. Ask for sanitization logs or destruction certificates.',
  },
  {
    id: 'pr-pe-l1-3.10.1',
    domain: 'PE', cardType: 'practice', level: 'L1', front: 'PE.L1-3.10.1',
    back: 'Limit physical access to organizational information systems to authorized individuals.\n\nAssessor lens: Badge readers that are routinely bypassed provide no control. Observe actual behavior during site visits — a propped server room door is an immediate finding.',
  },
  {
    id: 'pr-sc-l1-3.13.1',
    domain: 'SC', cardType: 'practice', level: 'L1', front: 'SC.L1-3.13.1',
    back: 'Monitor, control, and protect organizational communications at the external boundaries and key internal boundaries of the information system.\n\nAssessor lens: Firewalls must exist AND be configured. "Installed but default rules" does not satisfy this practice.',
  },
  {
    id: 'pr-si-l1-3.14.2',
    domain: 'SI', cardType: 'practice', level: 'L1', front: 'SI.L1-3.14.2',
    back: 'Provide protection from malicious code at appropriate locations within organizational information systems.\n\nAssessor lens: Windows Defender (active and updated) satisfies this. "No AV because it slows things down" is a finding. Performance is never an acceptable exception.',
  },

  // ─── L2 practice cards ───────────────────────────────────────────────────────

  {
    id: 'pr-ac-l2-3.1.12',
    domain: 'AC', cardType: 'practice', level: 'L2', front: 'AC.L2-3.1.12',
    back: 'Monitor and control remote access sessions.\n\nAssessor lens: Always-on VPN with no session limits is a finding. Look for: session timeouts, activity logging, post-connection access restrictions. Authentication satisfies IA controls — session monitoring is separate.',
  },
  {
    id: 'pr-au-l2-3.3.2',
    domain: 'AU', cardType: 'practice', level: 'L2', front: 'AU.L2-3.3.2',
    back: 'Review and analyze information system audit logs for indications of inappropriate or unusual activity.\n\nAssessor lens: Logs that are never reviewed provide zero security value. Evidence of routine review — SIEM dashboards, automated alerts, review records — is required. Reviewing only during incidents is a finding.',
  },
  {
    id: 'pr-cm-l2-3.4.1',
    domain: 'CM', cardType: 'practice', level: 'L2', front: 'CM.L2-3.4.1',
    back: 'Establish and maintain baseline configurations and inventories of organizational information systems.\n\nAssessor lens: A policy without actual documented baselines fails this. Baselines are the foundation of the entire CM domain — without them, 3.4.2 through 3.4.9 cannot be meaningfully assessed.',
  },
  {
    id: 'pr-cm-l2-3.4.2',
    domain: 'CM', cardType: 'practice', level: 'L2', front: 'CM.L2-3.4.2',
    back: 'Establish and enforce security configuration settings for information technology products employed in organizational information systems.\n\nWait — this is 3.4.6. CM.L2-3.4.2 is:\n\nEstablish and maintain baseline configurations and inventories, and control changes to those baselines.\n\nAssessor lens: Unauthorized software installations, unapproved config changes, and undocumented system changes are all findings.',
  },
  {
    id: 'pr-ia-l2-3.5.3',
    domain: 'IA', cardType: 'practice', level: 'L2', front: 'IA.L2-3.5.3',
    back: 'Use multifactor authentication for local and network access to privileged accounts, and for network access to non-privileged accounts.\n\nThree specific scenarios:\n1. Local access to privileged accounts → MFA required\n2. Network access to privileged accounts → MFA required\n3. Network access to non-privileged accounts → MFA required\n\nLocal non-privileged access is not explicitly covered by this practice.',
  },
  {
    id: 'pr-ir-l2-3.6.1',
    domain: 'IR', cardType: 'practice', level: 'L2', front: 'IR.L2-3.6.1',
    back: 'Establish an operational incident-handling capability that includes preparation, detection, analysis, containment, recovery, and user response activities.\n\nAssessor lens: An IR policy plus a contacts list satisfies the "establish" requirement. Failure to test or exercise the capability is a finding against 3.6.3, not this practice.',
  },
  {
    id: 'pr-ir-l2-3.6.3',
    domain: 'IR', cardType: 'practice', level: 'L2', front: 'IR.L2-3.6.3',
    back: 'Test the organizational incident response capability.\n\nAssessor lens: An untested IR plan is not a real capability. Ask for tabletop exercise records or documentation of actual incident handling. Annual testing is the expected cadence.',
  },
  {
    id: 'pr-ps-l2-3.9.2',
    domain: 'PS', cardType: 'practice', level: 'L2', front: 'PS.L2-3.9.2',
    back: 'Protect organizational systems during and after personnel actions such as terminations and transfers.\n\nAssessor lens: A gap between termination date and access revocation is a finding — even 1 day. This is one of the highest-risk findings because insider threat peaks at termination. Ask for HR/IT coordination procedures.',
  },
  {
    id: 'pr-ra-l2-3.11.1',
    domain: 'RA', cardType: 'practice', level: 'L2', front: 'RA.L2-3.11.1',
    back: 'Periodically assess the risk to organizational operations, organizational assets, and individuals resulting from the operation of organizational systems and associated processing, storage, or transmission of CUI.\n\nAssessor lens: "Periodic" means both scheduled AND triggered by significant changes. Adding a cloud system that processes CUI triggers an update — waiting for the annual cycle is a finding.',
  },
  {
    id: 'pr-ca-l2-3.12.4',
    domain: 'CA', cardType: 'practice', level: 'L2', front: 'CA.L2-3.12.4',
    back: 'Develop, document, and periodically update system security plans that describe system boundaries, system environments of operation, how security requirements are implemented, and the relationships with or connections to other systems.\n\nAssessor lens: An SSP that does not reflect the current environment is a finding. A stale SSP undermines every other practice — assessors cannot trust it as evidence.',
  },
  {
    id: 'pr-sc-l2-3.13.8',
    domain: 'SC', cardType: 'practice', level: 'L2', front: 'SC.L2-3.13.8',
    back: 'Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission unless otherwise protected by alternative physical safeguards.\n\nAssessor lens: "Internal" transmissions are not exempt. Traffic between facilities, between systems, or across any network segment must be encrypted. On-premises email traversing a network is in-transit, not at-rest.',
  },
  {
    id: 'pr-si-l2-3.14.3',
    domain: 'SI', cardType: 'practice', level: 'L2', front: 'SI.L2-3.14.3',
    back: 'Monitor information system security alerts and advisories and take appropriate actions in response.\n\nAssessor lens: Receiving DIBcSAC threat intelligence but not integrating it into monitoring tools is a finding. Threat intelligence has no value if not operationalized — verify IOCs are connected to detection rules.',
  },

  // ─── L3 Practice cards (NIST SP 800-172) ────────────────────────────────────

  {
    id: 'pr-ra-l3-3.11.1e',
    domain: 'RA', cardType: 'practice', level: 'L3', front: 'RA.L3-3.11.1e',
    back: 'Employ threat intelligence, in conjunction with a risk assessment, to guide and inform the development of organizational systems, security architectures, security requirements, security controls, and threat models.\n\nKey distinction from L2: Threat intelligence must actively inform risk assessments and architecture decisions — not just feed the SOC alerting queue. Nation-state TTPs targeting the DIB must be mapped to your specific CUI assets.\n\nAssessor lens: Ask for evidence that threat intel is feeding the risk assessment process, not just the alerting queue.',
  },
  {
    id: 'pr-ra-l3-3.11.2e',
    domain: 'RA', cardType: 'practice', level: 'L3', front: 'RA.L3-3.11.2e',
    back: 'Conduct cyber threat hunting activities to proactively search for indicators of compromise in organizational systems and to detect, track, and disrupt threats that evade existing controls.\n\nKey distinction from detection: Threat hunting is human-led and assumes compromise. Hunters hypothesize how an APT would operate in the environment, then search for evidence — not waiting for an alert.\n\nAssessor lens: Look for documented hunt hypotheses, methodology, scope, and findings. "We have a SIEM" is not threat hunting.',
  },
  {
    id: 'pr-ra-l3-3.11.3e',
    domain: 'RA', cardType: 'practice', level: 'L3', front: 'RA.L3-3.11.3e',
    back: 'Employ a process to assess the security of external providers and the supply chain risks associated with the acquisition of hardware, software, and services.\n\nKey focus: Counterfeit components, malicious firmware, and compromised software delivered via trusted suppliers. Traditional procurement (approved vendor lists, COCs) is insufficient — requires structured risk assessment of each acquisition.\n\nAssessor lens: Ask for a formal SCRM program, risk assessments for critical acquisitions, and tamper-evidence controls.',
  },
  {
    id: 'pr-si-l3-3.14.1e',
    domain: 'SI', cardType: 'practice', level: 'L3', front: 'SI.L3-3.14.1e',
    back: 'Verify the integrity of security-critical or essential software using root of trust mechanisms or cryptographic signatures.\n\nKey term — root of trust: Hardware-anchored integrity verification (TPM + Secure Boot) that cannot be defeated from software. Detects firmware and bootloader tampering that survives OS reinstallation.\n\nAssessor lens: Look for TPM deployment, Secure Boot configuration, and measured boot evidence. Periodic hash checks from the OS layer do not satisfy this — they can be defeated by firmware-level malware.',
  },
  {
    id: 'pr-si-l3-3.14.2e',
    domain: 'SI', cardType: 'practice', level: 'L3', front: 'SI.L3-3.14.2e',
    back: 'Monitor individuals and system components on an ongoing basis for anomalous or suspicious behavior and characteristics indicative of insider threat.\n\nKey distinction from L2 monitoring: Behavioral analytics (UEBA) detects deviations from established normal activity patterns — not just known-bad indicators. Catches APT techniques that mimic legitimate user behavior.\n\nAssessor lens: Ask for evidence of behavioral baselining, not just SIEM alert rules. Statistical deviation detection is the target capability.',
  },
  {
    id: 'pr-si-l3-3.14.3e',
    domain: 'SI', cardType: 'practice', level: 'L3', front: 'SI.L3-3.14.3e',
    back: 'Employ deception techniques and technologies to identify compromised users or systems or to confuse and mislead adversaries.\n\nExamples: Honeypots, honeynets, decoy accounts, canary tokens, honey credentials.\n\nStrategic value: Any interaction with a decoy is a high-fidelity alert — no tuning required, zero false positives. Catches lateral movement that evades signature-based tools.\n\nAssessor lens: Are decoys realistic and enticing? Are alerts operationalized and routed to the SOC?',
  },
  {
    id: 'pr-ca-l3-3.12.1e',
    domain: 'CA', cardType: 'practice', level: 'L3', front: 'CA.L3-3.12.1e',
    back: 'Employ independent teams to conduct penetration testing on organizational systems or system components using adversarial techniques and tools.\n\nKey distinction from vulnerability assessment: Adversarial pen testing uses APT TTPs, follows multi-stage attack chains (initial access → lateral movement → CUI access), and chains low-severity findings together — not just scan and report individual CVEs.\n\nAssessor lens: Verify the team is independent (not internal security staff), scope covers CUI systems, and methodology includes threat-informed attack simulation.',
  },
  {
    id: 'pr-ca-l3-3.12.2e',
    domain: 'CA', cardType: 'practice', level: 'L3', front: 'CA.L3-3.12.2e',
    back: 'Conduct application security reviews of systems, including web-based applications and interfaces to external systems, using sound application security practices.\n\nKey requirement — independence: Teams must be independent of the organization\'s regular security function. Independence addresses organizational bias — insiders unconsciously avoid testing systems they believe are well-protected.\n\nAssessor lens: Ask who conducted the assessment. Internal teams with institutional knowledge do not satisfy the independence requirement.',
  },
  {
    id: 'pr-ir-l3-3.6.1e',
    domain: 'IR', cardType: 'practice', level: 'L3', front: 'IR.L3-3.6.1e',
    back: 'Establish and maintain a security operations center (SOC) capability to address threats to organizational systems, including malicious code, malicious websites, breaches, and targeted attacks.\n\nKey distinction from L2 IR: L3 requires a CIRT with APT-specific capabilities — understanding persistent adversary techniques, firmware implants, long-dwell-time compromises, and nation-state TTPs. Re-imaging workstations is not sufficient incident response for APT-level intrusions.\n\nAssessor lens: Verify APT-specific playbooks and forensic capability against advanced persistence mechanisms exist.',
  },
  {
    id: 'pr-ir-l3-3.6.2e',
    domain: 'IR', cardType: 'practice', level: 'L3', front: 'IR.L3-3.6.2e',
    back: 'Track and transfer threat intelligence pertaining to threats posed by advanced persistent threats to organizational officials responsible for making risk-based decisions.\n\nKey requirement — bidirectional sharing: The organization contributes observed TTPs and IOCs to DIB-ISAC, CISA, and DCSA — and receives enriched intelligence in return. Collective defense model: nation-state campaigns target multiple DIB members simultaneously.\n\nAssessor lens: Verify ISAC membership, evidence of intelligence contributions (not just consumption), and integration of received intel into the IR process.',
  },
  {
    id: 'pr-sc-l3-3.13.4e',
    domain: 'SC', cardType: 'practice', level: 'L3', front: 'SC.L3-3.13.4e',
    back: 'Employ boundary protection mechanisms to separate organizational systems and system components.\n\nKey distinction from standard segmentation: L3 requires managed interfaces — controlled access points with deny-by-default policies specifically designed to impede APT lateral movement. Focus is on east-west (internal) traffic, not just north-south (perimeter).\n\nAssessor lens: Is boundary protection perimeter-only, or is internal east-west traffic equally controlled? A flat internal network is a finding regardless of perimeter strength.',
  },
  {
    id: 'pr-at-l3-3.2.2e',
    domain: 'AT', cardType: 'practice', level: 'L3', front: 'AT.L3-3.2.2e',
    back: 'Provide awareness training focused on recognizing and responding to threats from social engineering, advanced persistent threats, and insider threats.\n\nKey distinction from L2 training: Content must cover nation-state TTPs — targeted spear phishing with DIB-specific lures, watering hole attacks, multi-stage social engineering, and the specific indicators of being targeted by a nation-state actor.\n\nAssessor lens: Review training content, not just completion records. "Click-through awareness training" does not satisfy this requirement.',
  },
  {
    id: 'pr-cm-l3-3.4.1e',
    domain: 'CM', cardType: 'practice', level: 'L3', front: 'CM.L3-3.4.1e',
    back: 'Establish and maintain an authoritative source and process for providing CUI-accessible system component information.\n\nKey extension beyond L2 baseline: L3 adds firmware-level tracking and verification. Hardware firmware versions must be inventoried and verified not to have been modified from the manufacturer baseline — addressing firmware implants and supply chain tampering.\n\nAssessor lens: Ask whether firmware versions are tracked alongside OS/application configurations. A configuration management system that only tracks software-layer state is insufficient at L3.',
  },
  {
    id: 'pr-cm-l3-3.4.2e',
    domain: 'CM', cardType: 'practice', level: 'L3', front: 'CM.L3-3.4.2e',
    back: 'Establish and maintain an authoritative source for configuration management decisions for CUI system components that are associated with or connected to external networks.\n\nKey requirement — supply chain receipt inspection: Hardware and firmware must be verified as authentic (not counterfeit) and unmodified before deployment into CUI environments. Vendor attestation is a process control, not technical verification.\n\nMethods: Cryptographic firmware signature verification, manufacturer direct-ship programs, receipt inspection.\n\nAssessor lens: "We buy from approved vendors" is insufficient. Ask for the technical verification process.',
  },
  {
    id: 'pr-ia-l3-3.5.3e',
    domain: 'IA', cardType: 'practice', level: 'L3', front: 'IA.L3-3.5.3e',
    back: 'Employ replay-resistant authentication mechanisms for access to privileged and non-privileged accounts.\n\nKey L3 capabilities:\n• Privileged Access Workstations (PAWs) — isolated devices for privileged tasks only\n• Just-in-time (JIT) access — time-bounded privileges, no persistent privileged sessions\n• Hardware-backed MFA (PIV/FIDO2) — phishing-resistant, cannot be replayed or harvested from memory\n\nSoftware MFA (TOTP) is insufficient at L3 — can be phished or stolen from memory.\n\nAssessor lens: Verify PAW deployment, JIT workflow, and whether privileged authentication is truly phishing-resistant.',
  },
  {
    id: 'pr-ac-l3-3.1.3e',
    domain: 'AC', cardType: 'practice', level: 'L3', front: 'AC.L3-3.1.3e',
    back: 'Employ secure information transfer solutions to control information flows between security domains on connected systems.\n\nKey term — hardware enforcement: Data diodes and unidirectional security gateways use hardware to make reverse communication physically impossible — not just policy-prevented. Eliminates covert channel communication.\n\nDistinction from software controls: Firewalls and DLP can be misconfigured or exploited. Hardware-enforced unidirectional gateways have no software vulnerability to exploit.\n\nAssessor lens: Ask for architectural justification and confirm hardware (not software) enforcement for cross-domain transfers.',
  },

  // ─── L1 practice cards (gap fill) ───────────────────────────────────────────

  {
    id: 'pr-ac-l1-3.1.20',
    domain: 'AC', cardType: 'practice', level: 'L1', front: 'AC.L1-3.1.20',
    back: 'Verify and control/limit connections to external information systems.\n\nWhat it means: Before connecting to a system outside your organization (e.g., a partner network, cloud service, government portal), verify the connection is authorized and implement controls on what data can flow across it.\n\nKey implementation: Interconnection Security Agreements (ISAs) or Memoranda of Understanding (MOUs) with external parties; firewall rules limiting traffic to authorized protocols and destinations.\n\nCommon failure: Ad-hoc connections to external systems with no formal approval, no traffic restrictions, and no documentation.',
  },
  {
    id: 'pr-pe-l1-3.10.2',
    domain: 'PE', cardType: 'practice', level: 'L1', front: 'PE.L1-3.10.2',
    back: 'Escort visitors and monitor visitor activity; maintain audit logs of physical access.\n\nTwo requirements in one:\n1. Escort: visitors must be accompanied by authorized personnel at all times in CUI areas — they cannot be left unattended\n2. Log: maintain records of who visited, when, and for what purpose\n\nCommon failure: Signing visitors in at reception but allowing them to walk unescorted to a conference room that shares a wall with the server room.\n\nAssessor test: Ask to see the visitor log. Ask who accompanies visitors in CUI areas.',
  },
  {
    id: 'pr-sc-l1-3.13.5',
    domain: 'SC', cardType: 'practice', level: 'L1', front: 'SC.L1-3.13.5',
    back: 'Implement subnetworks for publicly accessible system components.\n\nWhat it means: Publicly accessible systems (web servers, email gateways, VPN concentrators) must be placed in a DMZ — a separate network segment that is isolated from internal systems where CUI lives.\n\nWhy: If an internet-facing system is compromised, a DMZ limits the attacker\'s lateral movement into the internal network.\n\nFlat network = finding: Any organization with a single flat network where internet-accessible servers and CUI workstations share the same subnet fails this practice.',
  },
  {
    id: 'pr-si-l1-3.14.1',
    domain: 'SI', cardType: 'practice', level: 'L1', front: 'SI.L1-3.14.1',
    back: 'Identify, report, and correct information and information system flaws in a timely manner.\n\nWhat it means: Patch management — find vulnerabilities (scanning, vendor advisories), report them internally, and fix them within a defined timeframe.\n\n"Timely" is not defined in the practice — the organization must define it in policy. Common timelines:\n• Critical: 30 days\n• High: 60 days\n• Medium/Low: 90 days\n\nConnects to: RA.L2-3.11.2 (scanning) and RA.L2-3.11.3 (risk-based remediation) at L2.',
  },

  // ─── MA L2 practice cards ────────────────────────────────────────────────────

  {
    id: 'pr-ma-l2-3.7.1',
    domain: 'MA', cardType: 'practice', level: 'L2', front: 'MA.L2-3.7.1',
    back: 'Perform maintenance on organizational systems.\n\nWhat it means: Maintenance must be controlled — authorized, scheduled, and documented. Ad-hoc, undocumented maintenance by unknown individuals is not compliant.\n\nKey requirements:\n• Only authorized personnel perform maintenance\n• Maintenance activities are scheduled and logged\n• Systems returned to operational condition after maintenance are verified before reuse\n\nAssessor lens: Ask for the maintenance log. Who performed the last maintenance on CUI-adjacent systems? Was it documented? Was the system verified afterward?',
  },
  {
    id: 'pr-ma-l2-3.7.2',
    domain: 'MA', cardType: 'practice', level: 'L2', front: 'MA.L2-3.7.2',
    back: 'Provide controls on the tools, techniques, mechanisms, and personnel for system maintenance.\n\nWhat it means: The tools used for maintenance (diagnostic software, remote access tools, test equipment) must be controlled — approved, inventoried, and checked for malicious code before use.\n\nKey controls:\n• Approved maintenance tool list\n• Check diagnostic media/tools for malware before use (see MA.L2-3.7.4)\n• Prevent use of unapproved or personally-owned maintenance tools on CUI systems\n\nRisk: A maintenance technician\'s personal laptop used for diagnostics is an uncontrolled entry point into the CUI environment.',
  },
  {
    id: 'pr-ma-l2-3.7.5',
    domain: 'MA', cardType: 'practice', level: 'L2', front: 'MA.L2-3.7.5',
    back: 'Require MFA for remote maintenance sessions; terminate sessions when no longer needed.\n\nWhy this practice exists: Remote maintenance sessions have administrative-level access to systems. Without MFA, a stolen credential gives an attacker the same access a maintenance technician has — including the ability to disable security controls.\n\nTwo requirements:\n1. MFA: remote maintenance must require two factors — not just a password\n2. Session termination: sessions must be explicitly closed when maintenance is complete — not left open indefinitely\n\nCommon failure: Vendor uses a persistent remote access tool (e.g., TeamViewer, AnyDesk) that is always connected and protected only by a password.',
  },

  // ─── AT L2 practice cards ────────────────────────────────────────────────────

  {
    id: 'pr-at-l2-3.2.1',
    domain: 'AT', cardType: 'practice', level: 'L2', front: 'AT.L2-3.2.1',
    back: 'Ensure that organizational personnel are aware of the security risks associated with their activities and of the applicable policies, procedures, and agreements.\n\nThis is general security awareness — every person who touches CUI systems must understand:\n• What CUI is and how to handle it\n• Phishing and social engineering tactics\n• Acceptable use policy\n• Incident reporting procedures\n\nKey distinction from AT.L2-3.2.2: This is awareness (everyone), not role-based training (specific job functions).\n\nAssessor test: Ask any CUI-handling employee what to do if they receive a suspicious email. If they don\'t know the reporting procedure, awareness is insufficient.',
  },
  {
    id: 'pr-at-l2-3.2.2',
    domain: 'AT', cardType: 'practice', level: 'L2', front: 'AT.L2-3.2.2',
    back: 'Ensure that personnel are trained to carry out their assigned information security responsibilities.\n\nThis is role-based training — matched to specific job security responsibilities:\n• Network admins: firewall management, patching procedures, incident handling\n• Developers: secure coding, input validation, dependency hygiene\n• HR: personnel security, termination procedures, insider threat reporting\n• System owners: SSP maintenance, POA&M tracking\n\nKey distinction from AT.L2-3.2.1: 3.2.1 is awareness for everyone; 3.2.2 is training for the specific security tasks each role performs.\n\nCommon failure: Only the ISSO receives security training while developers and admins who implement security controls receive none.',
  },

  // ─── MP L2 practice cards ────────────────────────────────────────────────────

  {
    id: 'pr-mp-l2-3.8.1',
    domain: 'MP', cardType: 'practice', level: 'L2', front: 'MP.L2-3.8.1',
    back: 'Protect (i.e., physically control and securely store) system media containing CUI, both paper and digital.\n\nCovers: hard drives, USB drives, backup tapes, printed CUI documents, optical discs, mobile devices.\n\nWhat protection means:\n• Physical: locked cabinets, access-controlled storage areas, clean desk policy for paper CUI\n• Environmental: protection from electromagnetic interference, temperature extremes\n• Accountability: know where all CUI media is at all times\n\nCommon failure: Printed CUI reports left on desks, printers, or in recycling bins. Backup tapes stored in an unlocked cabinet in the server room.',
  },
  {
    id: 'pr-mp-l2-3.8.7',
    domain: 'MP', cardType: 'practice', level: 'L2', front: 'MP.L2-3.8.7',
    back: 'Control the use of removable media on system components.\n\nWhat it means: Define which removable media types (USB drives, external HDDs, SD cards, optical media) are permitted on in-scope systems, and enforce that policy technically — not just through policy documents.\n\nImplementation options:\n• Block all USB storage via endpoint controls (Group Policy, MDM, EDR)\n• Whitelist only approved, organization-issued devices\n• Log all removable media connection events\n\nRelated: MP.L2-3.8.8 bans removable media with no identifiable owner.\n\nCommon failure: Policy says "no personal USB drives" but no technical enforcement — employees plug in personal drives with no alert or block.',
  },

  // ─── PE L2 practice cards ────────────────────────────────────────────────────

  {
    id: 'pr-pe-l2-3.10.3',
    domain: 'PE', cardType: 'practice', level: 'L2', front: 'PE.L2-3.10.3',
    back: 'Escort visitors and monitor visitor activity in areas where CUI is processed or stored.\n\nL2 extends the L1 requirement with explicit focus on CUI areas.\n\nWhat "escort" requires:\n• A cleared/authorized employee accompanies the visitor at all times — not just to the front door\n• The escort stays with the visitor throughout their time in CUI areas\n• The escort is responsible for the visitor\'s actions in the facility\n\nCommon misunderstanding: Signing in at reception and giving a visitor a badge does not satisfy this — the badge allows building access but not unescorted access to CUI areas.',
  },
  {
    id: 'pr-pe-l2-3.10.6',
    domain: 'PE', cardType: 'practice', level: 'L2', front: 'PE.L2-3.10.6',
    back: 'Enforce safeguarding measures for CUI at alternate work sites (e.g., telework locations).\n\nWhat it means: CUI protections do not stop at the office door. Employees working from home or remote locations must apply the same CUI handling requirements they would at the primary facility.\n\nKey requirements for remote/telework:\n• VPN for all CUI access — no cleartext transmission\n• Locked storage for any physical CUI (paper, media)\n• No family members or unauthorized individuals present when CUI is on screen\n• Screen lock when stepping away\n• Approved device policy — no personal devices for CUI\n\nAssessor lens: Ask for the telework security policy. Is it specific about CUI handling, or generic? Are controls technically enforced or policy-only?',
  },

  // ─── AU L2 gap fill ──────────────────────────────────────────────────────────

  {
    id: 'pr-au-l2-3.3.8',
    domain: 'AU', cardType: 'practice', level: 'L2', front: 'AU.L2-3.3.8',
    back: 'Protect audit information and audit tools from unauthorized access, modification, and deletion.\n\nWhy it matters: An attacker who can delete or modify logs can erase the evidence of their intrusion. An insider threat who controls their own audit trail is effectively undetectable.\n\nHow to implement:\n• Forward logs to a centralized SIEM or write-protected log server in real time — local deletion cannot destroy what is already centralized\n• Restrict who can clear event logs — separate from local admin rights\n• Enable integrity checking on log files\n• Role-based access: audit log access ≠ admin access\n\nKey principle: Logs must be protected by a system the attacker does not control.',
  },

  // ─── CA L2 gap fill ──────────────────────────────────────────────────────────

  {
    id: 'pr-ca-l2-3.12.2',
    domain: 'CA', cardType: 'practice', level: 'L2', front: 'CA.L2-3.12.2',
    back: 'Develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities.\n\nThe POA&M: every identified security gap gets a plan of action with:\n• Specific deficiency description\n• Planned corrective action\n• Responsible party (named individual)\n• Scheduled completion date\n• Current status and milestone updates\n• Compensating controls in place during remediation\n\nA POA&M is not a parking lot — it is an active remediation plan that must show progress.\n\nRed flags: Items open >12 months with no milestone update; no compensating controls on high-severity items; responsible party listed as "IT team."',
  },

  // ─── PS L2 gap fill ──────────────────────────────────────────────────────────

  {
    id: 'pr-ps-l2-3.9.1',
    domain: 'PS', cardType: 'practice', level: 'L2', front: 'PS.L2-3.9.1',
    back: 'Screen individuals prior to authorizing access to organizational systems containing CUI.\n\nWhat screening means:\n• Background checks appropriate to the role and CUI sensitivity\n• Verification of credentials and employment history\n• For subcontractors: flow-down of screening requirements\n\nKey principle: Screening is a prerequisite for CUI access — it must occur before access is granted, not afterward.\n\nFlow-down obligation: If a contractor uses a subcontractor whose personnel will access CUI, the prime contractor is responsible for ensuring the sub\'s personnel are screened to the same standard.\n\nAssessor lens: Ask for the screening policy and recent hire records. Were background checks completed before system access was provisioned?',
  },

  // ─── Framework term cards (gap fill) ─────────────────────────────────────────

  {
    id: 'term-sprs',
    domain: 'CMMC', cardType: 'term', front: 'SPRS',
    back: 'Supplier Performance Risk System\n\nDoD\'s web-based system where defense contractors submit their NIST SP 800-171 self-assessment scores.\n\nScoring: Contractors calculate a score (from +110 to -203) based on their implementation status of all 110 NIST SP 800-171 practices. Each unimplemented practice results in a point deduction.\n\nRequired by: DFARS 252.204-7019 — contractors must submit their score to SPRS before being awarded certain DoD contracts.\n\nNot a certification: SPRS scores are self-attested. CMMC third-party assessments validate the claims made in SPRS.',
  },
  {
    id: 'term-dfars-7012',
    domain: 'CMMC', cardType: 'term', front: 'DFARS 252.204-7012',
    back: 'Defense Federal Acquisition Regulation Supplement clause requiring contractors to:\n1. Implement NIST SP 800-171 to protect CUI\n2. Report cyber incidents to DoD within 72 hours of discovery\n3. Submit malware samples to DC3 upon request\n4. Preserve images of compromised systems for 90 days\n5. Flow down requirements to subcontractors handling CUI\n\nKey number to know: 72-hour reporting clock — starts at discovery, not confirmation.\n\nRelationship to CMMC: DFARS 7012 predates CMMC and remains in effect. CMMC adds third-party validation to the self-attestation model in DFARS 7012.',
  },
  {
    id: 'term-enclave',
    domain: 'CMMC', cardType: 'term', front: 'CUI Enclave',
    back: 'A defined, bounded environment where CUI is processed, stored, or transmitted — and to which CMMC requirements apply.\n\nWhy it matters for scoping: CMMC requirements apply to the enclave (the CUI environment) and the systems within it. Systems that are completely isolated from CUI are out of scope.\n\nWhat defines the boundary:\n• Network segmentation (firewalls, VLANs)\n• Physical access controls\n• Data flow documentation (what CUI flows in and out, and how)\n\nAssessor focus: Scoping is the first step of every CMMC assessment. A well-defined, well-defended enclave is preferable to a large, diffuse scope. The boundary must be documented in the SSP.',
  },
]

/** Returns all cards for a given domain */
export function getCardsByDomain(domain: string): Flashcard[] {
  return SEED_FLASHCARDS.filter(c => c.domain === domain)
}

/** Returns all unique domains that have cards */
export function getDomainsWithCards(): string[] {
  return [...new Set(SEED_FLASHCARDS.map(c => c.domain))]
}
