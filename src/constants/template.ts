export const templates = [
    {
        id: "blank",
        label: "Blank Document",
        imageUrl: "/blank-document.svg",
        initialContent: ""
    },
    {
        id: "business-letter",
        label: "Business Letter",
        imageUrl: "/business-letter.svg",
        initialContent: `
            <p><strong>[Your Company Name]</strong></p>
            <p>[Your Address]<br>[City, State ZIP]</p>
            <p><br></p>
            <p>[Date]</p>
            <p><br></p>
            <p><strong>[Recipient Name]</strong><br>[Recipient Title]<br>[Company Name]<br>[Company Address]</p>
            <p><br></p>
            <p>Dear [Recipient Name],</p>
            <p><br></p>
            <p>State the main purpose of your letter here. Keep it concise, professional, and to the point. Use the following paragraphs to provide additional details, context, or supporting information.</p>
            <p><br></p>
            <p>Conclude the letter by stating any necessary next steps, deadlines, or calls to action. Thank the recipient for their time and consideration.</p>
            <p><br></p>
            <p>Sincerely,</p>
            <p><br><br></p>
            <p><strong>[Your Name]</strong><br>[Your Title]</p>
        `
    },
    {
        id: "cover-letter",
        label: "Cover Letter",
        imageUrl: "/cover-letter.svg",
        initialContent: `
            <p><strong>[Your Name]</strong><br>[Your Phone Number] | [Your Email] | [Your LinkedIn/Portfolio]</p>
            <p><br></p>
            <p>[Date]</p>
            <p><br></p>
            <p><strong>[Hiring Manager's Name]</strong><br>[Company Name]<br>[Company Address]</p>
            <p><br></p>
            <p>Dear [Hiring Manager's Name],</p>
            <p><br></p>
            <p>I am writing to express my strong interest in the [Job Title] position at [Company Name], as advertised on [Where you found the job]. With a proven track record in [Mention 1-2 key skills or fields], I am confident in my ability to make an immediate impact on your team.</p>
            <p><br></p>
            <p>In my previous role at [Previous Company], I successfully [Mention a specific achievement with metrics if possible]. This experience has equipped me with the technical skills and strategic mindset needed to excel in this role.</p>
            <p><br></p>
            <p>I am drawn to [Company Name] because of your commitment to [Company's mission or a recent project]. I would welcome the opportunity to discuss how my background aligns with your current needs.</p>
            <p><br></p>
            <p>Thank you for your time and consideration.</p>
            <p><br></p>
            <p>Sincerely,</p>
            <p><br></p>
            <p>[Your Name]</p>
        `
    },
    {
        id: "letter",
        label: "Letter",
        imageUrl: "/letter.svg",
        initialContent: `
            <p>[Date]</p>
            <p><br></p>
            <p>Dear [Name],</p>
            <p><br></p>
            <p>Write your message here. This template is perfect for personal correspondence, informal requests, or general communications that don't require a strict corporate header.</p>
            <p><br></p>
            <p>Best regards,</p>
            <p><br><br></p>
            <p>[Your Name]</p>
        `
    },
    {
        id: "project-proposal",
        label: "Project Proposal",
        imageUrl: "/project-proposal.svg",
        initialContent: `
            <h1>Project Proposal: [Project Name]</h1>
            <p><strong>Prepared by:</strong> [Your Name/Company]<br><strong>Date:</strong> [Date]</p>
            <p><br></p>
            <h2>1. Executive Summary</h2>
            <p>Provide a high-level overview of the project, the problem it solves, and the primary goal.</p>
            <p><br></p>
            <h2>2. Objectives</h2>
            <ul>
                <li>Objective 1: Clearly define what success looks like.</li>
                <li>Objective 2: Keep it measurable and realistic.</li>
            </ul>
            <p><br></p>
            <h2>3. Proposed Solution</h2>
            <p>Detail how you plan to achieve the objectives and solve the client's problem.</p>
            <p><br></p>
            <h2>4. Timeline & Milestones</h2>
            <ul>
                <li><strong>Phase 1:</strong> Discovery & Planning (Weeks 1-2)</li>
                <li><strong>Phase 2:</strong> Execution (Weeks 3-6)</li>
                <li><strong>Phase 3:</strong> Delivery & Review (Week 7)</li>
            </ul>
            <p><br></p>
            <h2>5. Budget Estimate</h2>
            <p>Provide a clear breakdown of estimated costs, resources, and payment terms.</p>
        `
    },
    {
        id: "resume",
        label: "Resume",
        imageUrl: "/resume.svg",
        initialContent: `
            <h1 style="text-align: center;">[Your Name]</h1>
            <p style="text-align: center;">[City, State] | [Phone Number] | [Email Address] | [LinkedIn/Portfolio URL]</p>
            <p><br></p>
            <h2>Professional Summary</h2>
            <p>A highly motivated and results-driven professional with [Number] years of experience in [Industry/Field]. Proven ability to [Key Skill 1], [Key Skill 2], and drive [Specific Result].</p>
            <p><br></p>
            <h2>Work Experience</h2>
            <p><strong>[Job Title]</strong> | [Company Name], [Location]</p>
            <p><em>[Month, Year] – Present</em></p>
            <ul>
                <li>Spearheaded a new initiative that resulted in a [X]% increase in [Metric].</li>
                <li>Collaborated with cross-functional teams to deliver [Project Name] ahead of schedule.</li>
                <li>Streamlined internal processes, saving the company [X] hours per week.</li>
            </ul>
            <p><br></p>
            <p><strong>[Previous Job Title]</strong> | [Previous Company Name], [Location]</p>
            <p><em>[Month, Year] – [Month, Year]</em></p>
            <ul>
                <li>Managed a budget of $[X] and successfully delivered all projects under budget.</li>
                <li>Trained and mentored a team of [X] junior employees.</li>
            </ul>
            <p><br></p>
            <h2>Education</h2>
            <p><strong>[Degree Name, e.g., B.S. in Computer Science]</strong></p>
            <p>[University Name], [Graduation Year]</p>
            <p><br></p>
            <h2>Skills</h2>
            <p><strong>Technical:</strong> Skill 1, Skill 2, Skill 3, Skill 4<br><strong>Soft Skills:</strong> Leadership, Communication, Problem Solving</p>
        `
    },
    {
        id: "software-proposal",
        label: "Software Proposal",
        imageUrl: "/software-proposal.svg",
        initialContent: `
            <h1>Software Development Proposal</h1>
            <p><strong>Project:</strong> [App/Software Name]<br><strong>Client:</strong> [Client Name]</p>
            <p><br></p>
            <h2>1. Project Overview</h2>
            <p>Briefly describe the software to be built, the target audience, and the primary business value it will deliver.</p>
            <p><br></p>
            <h2>2. Scope of Work</h2>
            <ul>
                <li><strong>Frontend:</strong> User authentication, dashboard interface, and responsive design.</li>
                <li><strong>Backend:</strong> Database architecture, API development, and third-party integrations.</li>
                <li><strong>QA & Testing:</strong> Automated unit testing and user acceptance testing (UAT).</li>
            </ul>
            <p><br></p>
            <h2>3. Technology Stack</h2>
            <p>We propose utilizing the following modern technologies to ensure scalability and performance:</p>
            <ul>
                <li><strong>Frontend:</strong> React / Next.js</li>
                <li><strong>Backend:</strong> Node.js / Express</li>
                <li><strong>Database:</strong> PostgreSQL</li>
                <li><strong>Hosting:</strong> Vercel / AWS</li>
            </ul>
            <p><br></p>
            <h2>4. Development Phases & Timeline</h2>
            <p>The estimated time to MVP completion is <strong>[X] weeks</strong>.</p>
            <ul>
                <li>Week 1-2: UI/UX Design & Prototyping</li>
                <li>Week 3-6: Core Backend & API Development</li>
                <li>Week 7-9: Frontend Integration & Polish</li>
                <li>Week 10: Testing, Bug Fixes, & Deployment</li>
            </ul>
            <p><br></p>
            <h2>5. Investment</h2>
            <p>The total estimated cost for the deliverables outlined in this scope is <strong>$[Amount]</strong>.</p>
        `
    }
];