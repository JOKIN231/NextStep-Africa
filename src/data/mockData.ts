import { Opportunity, BlogPost } from '../types';

export const initialOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Africa Public Health Fellowship 2026',
    organization: 'Africa CDC (Centres for Disease Control and Prevention)',
    opportunityType: 'Fellowship',
    locationType: 'Hybrid',
    location: 'Addis Ababa, Ethiopia / Remote',
    description: 'This prestigious fellowship aims to support mid-career public health professionals across Africa to acquire advanced skills in health leadership, policy formulation, epidemiology, and emergency preparedness. Fellows will work alongside leading epidemiologists and policymakers to design intervention strategies for emerging disease outbreaks.',
    eligibility: 'Applicants must be citizens of an African Union Member State, possess a Master’s degree in Public Health, Medicine, or a related field, and have 3-5 years of working experience in national or international health agencies.',
    benefits: 'Full tuition coverage, monthly stipend of $2,500, return airfare to Addis Ababa, comprehensive health insurance, and placement with regional CDC hubs.',
    deadline: '2026-10-15',
    applyUrl: 'https://africacdc.org/fellowships',
    tags: ['Leadership', 'Epidemiology', 'Policy', 'Africa CDC'],
    featured: true,
    publishedAt: '2026-07-10T10:00:00Z',
    viewsCount: 245
  },
  {
    id: 'opp-2',
    title: 'Global Health Policy Internship',
    organization: 'World Health Organization (WHO) Africa Region',
    opportunityType: 'Internship',
    locationType: 'On-site',
    location: 'Brazzaville, Republic of Congo',
    description: 'The WHO Regional Office for Africa offers internships to students and recent graduates to gain firsthand experience in global health policy, health systems strengthening, and vaccine deployment programs in sub-Saharan Africa. Interns will assist with data monitoring, report draft compilation, and regional webinars.',
    eligibility: 'Currently enrolled in an undergraduate or postgraduate program (Master or PhD) in Public Health, Global Health, Social Sciences, or completed graduate studies within the last six months.',
    benefits: 'Monthly living allowance, standard travel subsidy, and professional mentoring by WHO technical officers.',
    deadline: '2026-08-30',
    applyUrl: 'https://www.who.int/careers/internships',
    tags: ['WHO', 'Global Health', 'Health Systems', 'Internship'],
    featured: true,
    publishedAt: '2026-07-12T08:30:00Z',
    viewsCount: 189
  },
  {
    id: 'opp-3',
    title: 'Sub-Saharan Malaria Research Grant',
    organization: 'Bill & Melinda Gates Foundation',
    opportunityType: 'Funding',
    locationType: 'Remote',
    location: 'Sub-Saharan Africa',
    description: 'A dedicated grant opportunity designed to support indigenous African researchers developing innovative molecular surveillance, vector control strategies, or community-based intervention models to accelerate the eradication of malaria in high-burden regions.',
    eligibility: 'Principal Investigators must be affiliated with an accredited African university, research institute, or non-governmental organization (NGO) operating in Sub-Saharan Africa.',
    benefits: 'Grants ranging from $50,000 to $150,000 for up to 24 months, access to research networks, and publication cost coverage.',
    deadline: '2026-11-01',
    applyUrl: 'https://www.gatesfoundation.org/grants',
    tags: ['Malaria', 'Research', 'Funding', 'Innovation'],
    featured: true,
    publishedAt: '2026-07-05T14:00:00Z',
    viewsCount: 312
  },
  {
    id: 'opp-4',
    title: 'Postgraduate Scholarship in Epidemiology & Biostatistics',
    organization: 'Wits School of Public Health',
    opportunityType: 'Scholarship',
    locationType: 'On-site',
    location: 'Johannesburg, South Africa',
    description: 'Fully funded scholarships for outstanding African students to pursue an MSc or PhD in Epidemiology and Biostatistics. The curriculum emphasizes quantitative research methods, implementation science, and health economics relevant to low-resource settings.',
    eligibility: 'Must be an African national with an Honors degree or equivalent in health or mathematical sciences. Candidates with programming skills in R or Python are highly encouraged to apply.',
    benefits: 'Full tuition fee waiver, monthly stipend for living costs, research allowance, and laptop provision.',
    deadline: '2026-09-15',
    applyUrl: 'https://www.wits.ac.za/publichealth',
    tags: ['Academic', 'Epidemiology', 'Biostatistics', 'Scholarship'],
    featured: false,
    publishedAt: '2026-07-14T09:00:00Z',
    viewsCount: 154
  },
  {
    id: 'opp-5',
    title: 'Maternal and Child Health Advisor',
    organization: 'Amref Health Africa',
    opportunityType: 'Job',
    locationType: 'On-site',
    location: 'Nairobi, Kenya',
    description: 'Amref is seeking an experienced Maternal and Child Health (MCH) Advisor to lead the implementation of community-led maternal nutrition, safe delivery, and postnatal support services across Eastern and Southern African operations.',
    eligibility: 'Degree in Medicine or Nursing with a post-graduate qualification in Public Health or International Development. Minimum of 5 years of field experience managing maternal health programs.',
    benefits: 'Competitive salary packages, relocation assistance, pension benefits, and training opportunities.',
    deadline: '2026-08-25',
    applyUrl: 'https://amref.org/careers',
    tags: ['Maternal Health', 'Job', 'East Africa', 'Amref'],
    featured: false,
    publishedAt: '2026-07-16T11:45:00Z',
    viewsCount: 120
  },
  {
    id: 'opp-6',
    title: 'Youth Advocacy & Sexual Health Workshop 2026',
    organization: 'UNFPA (United Nations Population Fund)',
    opportunityType: 'Conference',
    locationType: 'Hybrid',
    location: 'Kigali, Rwanda',
    description: 'An interactive continental conference gathering public health advocates, youth leaders, and medical students to deliberate on policies for improving sexual and reproductive health rights (SRHR), adolescent health services, and gender equity across Africa.',
    eligibility: 'Youth leaders, medical and nursing students, and junior advocacy officers aged 18-30 from across Africa.',
    benefits: 'Fully funded travel, accommodation, meals in Kigali for selected delegates, and advocacy toolkits.',
    deadline: '2026-09-05',
    applyUrl: 'https://www.unfpa.org/events/youth-srhr-africa',
    tags: ['SRHR', 'Youth Advocacy', 'Kigali', 'Conference'],
    featured: false,
    publishedAt: '2026-07-17T16:20:00Z',
    viewsCount: 98
  }
];

export const initialBlogs: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'How to Write a Winning Public Health Fellowship Personal Statement',
    slug: 'winning-public-health-fellowship-personal-statement',
    excerpt: 'Stand out in highly competitive programs like Africa CDC, WHO, and global health residencies. Master the art of articulating your vision, impact, and local public health story.',
    content: `A compelling personal statement is the single most critical component of a public health fellowship application. While your CV lists your degrees and research papers, your personal statement tells the admissions committee *why* you care about public health and *how* you intend to lead change in Africa.

### 1. Frame Your Personal "Why"
Don't start by repeating your CV. Start with a story. Was it an outbreak of cholera in your hometown that made you realize the importance of clean water policy? Was it watching nurses struggle with resource stockouts in your clinic? A concrete, personal hook immediately engages the reader.

### 2. Connect Your Past to Their Mission
Research the organization hosting the fellowship. If you are applying to the Africa CDC, read their *New Public Health Order* documents. Use keywords that align with their pillars:
* Health Systems Strengthening
* Local Manufacturing of Diagnostics and Vaccines
* Emergency Preparedness
* Public Health Workforce Development

### 3. Focus on Solutions, Not Just Problems
Too many applicants spend 80% of their essay describing general challenges (e.g., "Sub-Saharan Africa faces high infectious disease burdens"). The committee already knows the problems. They want to know what *you* will do to solve them. Outline a specific research interest or policy framework you want to spearhead.

### 4. Close with a Strong Return-on-Investment (ROI) for Your Community
Conclude by stating exactly how you will bring your skills back. Excellent programs exist to build long-term local capacity. Assure them that this training will empower you to create sustainable, high-impact regional interventions.`,
    author: {
      name: 'Dr. Chidi Okorie, MD, MPH',
      role: 'Associate Director of Health Policy, Africa CDC Fellowship Alum',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    category: 'Career Guide',
    tags: ['Fellowships', 'Writing Tips', 'Career Path', 'Mentorship'],
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200',
    featured: true,
    status: 'published',
    publishedAt: '2026-07-15T09:00:00Z',
    viewsCount: 420,
    readTimeMin: 5
  },
  {
    id: 'blog-2',
    title: 'The Digital Revolution in African Epidemiology: Tools and Skills You Need',
    slug: 'digital-revolution-african-epidemiology-tools-skills',
    excerpt: 'Traditional shoe-leather epidemiology is pairing with modern data science. Discover why tools like R, GIS, and machine learning are essential for the future of public health in Africa.',
    content: `Epidemiology is undergoing a massive paradigm shift. As mobile networks expand across the continent, public health agencies are moving away from paper surveys toward real-time digital surveillance systems.

### Essential Software Platforms
To remain competitive in today’s public health job market, mastering the following tools is no longer optional:

1. **R & RStudio**: The gold standard for biostatistical computing. It is free, open-source, and supported by a global community of researchers.
2. **QGIS / ArcGIS**: Vital for spatial analysis and mapping disease vectors, environmental risks, and access to clinics.
3. **ODK (Open Data Kit)**: A powerful, offline-first mobile survey suite used to collect field data seamlessly on Android tablets and smartphones.

### How to Get Started for Free
You do not need an expensive degree to learn these skills. Check out free courses on Coursera, edX, or the World Health Organization's *OpenWHO* platform. Building a GitHub portfolio showing how you cleaned and mapped open disease datasets is a surefire way to catch the eyes of recruiters at WHO, MSF, and health ministries.`,
    author: {
      name: 'Amina Diop, MSc',
      role: 'Lead Spatial Epidemiologist, Pasteur Institute Dakar',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    },
    category: 'Academic Resource',
    tags: ['Epidemiology', 'Data Science', 'R Programming', 'GIS'],
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    featured: false,
    status: 'published',
    publishedAt: '2026-07-12T11:15:00Z',
    viewsCount: 284,
    readTimeMin: 4
  },
  {
    id: 'blog-3',
    title: 'My Experience as a WHO Global Health Intern in Geneva and Brazzaville',
    slug: 'my-experience-who-global-health-intern-geneva-brazzaville',
    excerpt: 'Curious about what a WHO internship actually entails? Learn about the application process, daily responsibilities, and how to navigate global health diplomacy.',
    content: `Securing an internship at the World Health Organization (WHO) felt like a distant dream when I was studying in Accra. Last year, that dream became a reality. I spent six months split between the WHO HQ in Geneva and the regional office in Brazzaville.

Here are my key takeaways and tips for future interns:

### The Application Timeline
WHO hosts two primary application windows each year. The competition is intense, so ensure your resume outlines direct community health experience. Volunteer at vaccination drives, assist local health officers, or publish research abstracts. 

### Daily Realities
Contrary to popular belief, you won't just be making coffee. I was tasked with:
* Synthesizing vaccine distribution data across five West African countries.
* Drafting policy briefs for ministries of health.
* Coordinating logisitics for regional malaria advisory groups.

### Building Relationships
The greatest value of an internship is the network. Schedule 15-minute coffee chats with officers in departments you are curious about. Ask questions, listen to their career paths, and stay in touch. Those connections are often what leads to contract consultancy roles down the line.`,
    author: {
      name: 'Kofi Mensah, MPH',
      role: 'Health Policy Consultant, Former WHO Intern',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    category: 'Alumni Spotlight',
    tags: ['WHO', 'Internships', 'Career Path', 'Student Story'],
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200',
    featured: false,
    status: 'published',
    publishedAt: '2026-07-16T15:30:00Z',
    viewsCount: 395,
    readTimeMin: 6
  }
];
