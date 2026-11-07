from django.core.management.base import BaseCommand
from apps.dictionary.models import Category, Term, TermRelationship, TermExample, ReflectionQuestion, SourceReference

class Command(BaseCommand):
    help = 'Seeds curated mental health vocabulary dataset with explicit psychological relationships'

    def handle(self, *args, **options):
        self.stdout.write("Seeding mental health categories and terms...")

        # 1. Categories
        categories_data = [
            {
                'name': 'Emotional Exhaustion',
                'name_fil': 'Pagkaubos ng Lakas at Emosyon',
                'slug': 'emotional-exhaustion',
                'description': 'States of physical, cognitive, and emotional depletion from sustained demands.',
                'description_fil': 'Mga kalagayan ng pisikal at emosyonal na pagkaubos dahil sa matagalang pasanin.',
                'order': 1,
                'icon': 'battery-charging'
            },
            {
                'name': 'Stress & Anxiety',
                'name_fil': 'Stress at Pagkabalisa',
                'slug': 'stress-and-anxiety',
                'description': 'Apprehension, physiological tension, and responses to real or perceived threats.',
                'description_fil': 'Pangamba, kaba, tensyon sa katawan, at reaksyon sa mga hamon o banta.',
                'order': 2,
                'icon': 'alert-circle'
            },
            {
                'name': 'Emotional Experiences',
                'name_fil': 'Mga Karaniwang Emosyon',
                'slug': 'emotional-experiences',
                'description': 'Fundamental emotional states including sadness, grief, guilt, shame, and anger.',
                'description_fil': 'Pangunahing damdamin tulad ng kalungkutan, pighati, hiya, at galit.',
                'order': 3,
                'icon': 'heart'
            },
            {
                'name': 'Motivation & Engagement',
                'name_fil': 'Motibasyon at Sigasig',
                'slug': 'motivation-and-engagement',
                'description': 'Drive, apathy, inertia, and psychological barriers to taking action.',
                'description_fil': 'Kagustuhang kumilos, kawalan ng gana, at mga balakid sa pagsisimula.',
                'order': 4,
                'icon': 'compass'
            },
            {
                'name': 'Self-Perception & Identity',
                'name_fil': 'Pagtingin sa Sarili',
                'slug': 'self-perception',
                'description': 'Self-worth, internal critic, self-compassion, and identity beliefs.',
                'description_fil': 'Halaga ng sarili, labis na pagpuna sa sarili, at pagtanggap.',
                'order': 5,
                'icon': 'user'
            },
            {
                'name': 'Interpersonal Experiences',
                'name_fil': 'Pakikipagkapwa at Relasyon',
                'slug': 'interpersonal-experiences',
                'description': 'Belonging, rejection, loneliness, boundaries, and social connection.',
                'description_fil': 'Pakiramdam ng pag-iisa, pagtanggap, hangganan, at koneksyon sa iba.',
                'order': 6,
                'icon': 'users'
            },
            {
                'name': 'Coping & Regulation',
                'name_fil': 'Pagharap at Pagpapakalma',
                'slug': 'coping-and-regulation',
                'description': 'Skills, practices, and mechanisms for steadying emotions and surviving distress.',
                'description_fil': 'Mga paraan at kasanayan para pakalmahin ang sarili sa oras ng hirap.',
                'order': 7,
                'icon': 'shield'
            },
            {
                'name': 'Help-Seeking & Support',
                'name_fil': 'Paghiling ng Tulong',
                'slug': 'help-seeking',
                'description': 'Pathways, peer connection, counseling, and steps toward professional care.',
                'description_fil': 'Mga hakbang at paraan sa paglapit sa katuwang o propesyonal na tulong.',
                'order': 8,
                'icon': 'life-buoy'
            },
        ]

        categories_map = {}
        for cdata in categories_data:
            cat, _ = Category.objects.update_or_create(
                slug=cdata['slug'],
                defaults=cdata
            )
            categories_map[cat.slug] = cat

        # 2. Terms
        terms_data = [
            {
                'term': 'Burnout',
                'slug': 'burnout',
                'term_fil': 'Burnout (Sobra-sobrang Pagkaubos)',
                'category': categories_map['emotional-exhaustion'],
                'term_type': 'psychological',
                'short_definition': 'A state of physical, emotional, or mental exhaustion associated with prolonged, unmanaged stress.',
                'short_definition_fil': 'Kalagayan ng matinding pisikal at emosyonal na pagkaubos dulot ng matagalang stress na walang sapat na pahinga.',
                'detailed_definition': 'Burnout is characterized by emotional depletion, cynicism or mental detachment from responsibilities, and feelings of ineffectiveness. Recognized by the WHO as an occupational phenomenon rather than an isolated mood dip.',
                'detailed_definition_fil': 'Kinikilala ng World Health Organization bilang kalagayan ng patuloy na pagkaubos ng lakas, paglayo ng loob sa mga gawain, at pagbaba ng tiwala sa sariling kakayahan.',
                'in_simpler_terms': 'Feeling so thoroughly depleted by persistent demands that ordinary rest no longer seems to restore your energy.',
                'in_simpler_terms_fil': 'Pakiramdam na ubos na ubos ka na, kung saan kahit matulog o magpahinga ka ay pagod ka pa rin paggising.',
                'examples': [
                    ("Dreading waking up for classes or work every morning for weeks, feeling like you are operating on empty.",
                     "Araw-araw kang nagigising na parang ubos na ang lakas mo at mabigat ang bawat hakbang bago magsimula ang araw.")
                ],
                'questions': [
                    ("Has this feeling of depletion persisted even when you've had weekends or breaks to rest?",
                     "Nanatili ba ang matinding pagod kahit nagkaroon ka na ng oras magpahinga?"),
                    ("Do everyday responsibilities feel unusually burdensome or detached?",
                     "Pakiramdam mo ba ay nawawalan ka na ng gana sa mga gawaing dati mong nagagawa nang maayos?")
                ],
                'sources': [
                    ("WHO International Classification of Diseases (ICD-11)", "QD85 Burn-out Syndrome", "https://icd.who.int/browse11/l-m/en#/http://id.who.int/icd/entity/1291878064", True),
                    ("Maslach Burnout Inventory (MBI)", "Maslach & Jackson (1981)", "", False)
                ]
            },
            {
                'term': 'Overwhelm',
                'slug': 'overwhelm',
                'term_fil': 'Pagkabigla sa Dami ng Pasanin (Overwhelm)',
                'category': categories_map['emotional-exhaustion'],
                'term_type': 'everyday',
                'short_definition': 'The feeling that the demands placed on you far exceed your immediate capacity to process or manage them.',
                'short_definition_fil': 'Pakiramdam na sabay-sabay at sobra-sobra ang mga pasanin kumpara sa kaya mong dalhin sa sandaling ito.',
                'detailed_definition': 'Emotional overwhelm occurs when cognitive and sensory inputs outstrip coping resources, leading to mental freeze, paralysis, or a desire to shut down.',
                'detailed_definition_fil': 'Nangyayari kapag nagpatong-patong ang gawain at alalahanin kaya nahihirapang mag-isip o magdesisyon kung saan magsisimula.',
                'in_simpler_terms': 'Feeling like everything is happening all at once and your brain cannot find a place to start.',
                'in_simpler_terms_fil': 'Pakiramdam na parang sasabog ang isip mo dahil sa dami ng kailangang asikasuhin nang sabay-sabay.',
                'examples': [
                    ("Staring at a list of five urgent assignments and feeling entirely unable to write even a single word.",
                     "Nakatitig sa tambak na school requirements o gawaing-bahay nang hindi malaman kung anong uunahin.")
                ],
                'questions': [
                    ("Does breaking down your current situation into one single tiny step bring a slight sense of relief?",
                     "Makatutulong ba kung hahatiin mo ang mga gawain sa pinakamaliit na hakbang muna?")
                ],
                'sources': [
                    ("APA Dictionary of Psychology", "Entry: Emotional Overload", "https://dictionary.apa.org", False)
                ]
            },
            {
                'term': 'Chronic Stress',
                'slug': 'chronic-stress',
                'term_fil': 'Matagalang Stress (Chronic Stress)',
                'category': categories_map['stress-and-anxiety'],
                'term_type': 'psychological',
                'short_definition': 'A prolonged and continuous state of physiological and psychological arousal in response to enduring pressures.',
                'short_definition_fil': 'Matagalang tensyon sa katawan at isip dahil sa tuloy-tuloy na problemang walang agarang lunas.',
                'detailed_definition': 'Unlike acute stress which subsides once a situation resolves, chronic stress keeps cortisol and adrenaline elevated, taxing sleep, digestion, and emotional resilience.',
                'detailed_definition_fil': 'Hindi tulad ng karaniwang kaba na nawawala agad, ang matagalang stress ay nagpapanatili sa tensyon ng kalamnan, sakit ng ulo, at pagkabalisa.',
                'in_simpler_terms': 'Feeling like your nervous system is perpetually on high alert with no quiet period to recover.',
                'in_simpler_terms_fil': 'Pakiramdam na laging alerto at tensyonado ang katawan mo, na parang laging may nakaambang problema.',
                'examples': [
                    ("Worrying about family expenses, academic grades, and health difficulties every single day for months.",
                     "Araw-araw na pag-aalala sa gastusin sa pamilya at grado nang walang patid sa loob ng ilang buwan.")
                ],
                'questions': [
                    ("Do you notice physical signs like jaw clenching, tight shoulders, or stomach knots during rest?",
                     "Napapansin mo ba ang pananakit ng batok, balikat, o tiyan kahit walang ginagawa?")
                ],
                'sources': [
                    ("American Psychological Association", "Understanding Chronic Stress", "https://apa.org", False)
                ]
            },
            {
                'term': 'Temporary Tiredness',
                'slug': 'temporary-tiredness',
                'term_fil': 'Pansamantalang Pagod',
                'category': categories_map['emotional-exhaustion'],
                'term_type': 'everyday',
                'short_definition': 'A natural, short-term reduction in physical or mental energy that reliably resolves after adequate rest or sleep.',
                'short_definition_fil': 'Normal at panandaliang pagbaba ng lakas na karaniwang nawawala matapos ang maayos na tulog o pamamahinga.',
                'detailed_definition': 'A benign physiological response to recent physical exertion, late nights, or concentrated cognitive tasks. Core motivation and enjoyment of life remain intact.',
                'detailed_definition_fil': 'Karaniwang tugon ng katawan sa puyat o mabigat na gawain. Nanatili pa rin ang gana sa buhay kapag nakapagpahinga na.',
                'in_simpler_terms': 'You are physically weary, but sleeping well or taking a quiet day makes you feel like yourself again.',
                'in_simpler_terms_fil': 'Pagod ka lang dahil sa maghapong trabaho o pag-aaral, pero sumisigla ulit pagkatapos ng magandang tulog.',
                'examples': [
                    ("Feeling sleepy after studying late for an exam, but waking up refreshed after an 8-hour sleep.",
                     "Inaantok matapos ang pagsusulit, ngunit sumigla muli pagkatapos makabawi ng tulog.")
                ],
                'questions': [
                    ("Did you feel better and more optimistic after a good night's sleep or a quiet afternoon?",
                     "Bumuti ba ang pakiramdam mo matapos ang isang gabi ng mahimbing na tulog?")
                ],
                'sources': []
            },
            {
                'term': 'Sadness',
                'slug': 'sadness',
                'term_fil': 'Kalungkutan',
                'category': categories_map['emotional-experiences'],
                'term_type': 'everyday',
                'short_definition': 'A natural human emotional response to loss, disappointment, or painful experiences.',
                'short_definition_fil': 'Normal at makataong damdamin dulot ng pagkabigo, pagkawala, o masakit na karanasan.',
                'detailed_definition': 'Sadness is transient and adaptive; it allows us to process sorrow and signal our need for support without a complete loss of self-worth or cognitive functioning.',
                'detailed_definition_fil': 'Ang kalungkutan ay pansamantala at mahalagang bahagi ng pagkatao; hindi nito ganap na pinapatay ang kakayahang magsaya kapag may magandang nangyari.',
                'in_simpler_terms': 'Feeling down or crying because something hurt, while still being able to smile at a comforting memory or hug.',
                'in_simpler_terms_fil': 'Pagkalungkot dahil may nangyaring masakit, ngunit kaya pa ring ngumiti o makaramdam ng ginhawa sa yakap ng kaibigan.',
                'examples': [
                    ("Feeling sorrowful for a few days after receiving low marks or saying goodbye to a visiting relative.",
                     "Nalulungkot dahil sa mababang marka o pamamaalam sa mahal sa buhay.")
                ],
                'questions': [
                    ("Can you still experience moments of warmth, humor, or appetite despite feeling down?",
                     "May mga sandali pa rin ba na napapangiti ka o nagugutom kahit nalulungkot ka?")
                ],
                'sources': [
                    ("Paul Ekman", "Emotions Revealed: Recognizing Faces and Feelings", "", False)
                ]
            },
            {
                'term': 'Depression',
                'slug': 'depression',
                'term_fil': 'Depresyon (Clinical Depression)',
                'category': categories_map['emotional-experiences'],
                'term_type': 'clinical',
                'short_definition': 'A clinical mood disorder marked by persistent low mood, loss of interest in activities, and changes in sleep, energy, and self-worth lasting two weeks or more.',
                'short_definition_fil': 'Klinikal na karamdaman sa mood kung saan may patuloy na pagkawala ng gana, kawalan ng pag-asa, at pagbaba ng sigla sa loob ng dalawang linggo o higit pa.',
                'detailed_definition': 'Major Depressive Disorder is not merely sadness or weakness; it is a serious medical condition involving neurochemical and cognitive changes that interfere with daily life.',
                'detailed_definition_fil': 'Hindi ito simpleng pag-iinarte o kawalan ng pananampalataya; isa itong medikal na kondisyon na nangangailangan ng propesyonal na kalinga at pag-unawa.',
                'in_simpler_terms': 'A persistent grey cloud where feelings of pleasure, energy, and self-worth seem entirely muted, regardless of external circumstances.',
                'in_simpler_terms_fil': 'Pakiramdam na parang nababalot ka ng dilim kung saan walang nagpapasaya sa iyo at mabigat ang bawat minuto ng araw.',
                'examples': [
                    ("Finding it difficult to get out of bed for three straight weeks and having zero interest in hobbies you previously loved.",
                     "Tatlong linggo nang nahihirapang bumangon sa kama at wala nang maramdamang interes sa mga paboritong gawain.")
                ],
                'questions': [
                    ("Has this heavy numbness or despair lasted nearly every day for more than two weeks?",
                     "Tumagal na ba ang ganitong kawalan ng gana nang mahigit dalawang linggo?"),
                    ("Would you consider reaching out to the psychiatry clinic at ITRMC or calling 1553?",
                     "Bukas ka ba sa pakikipag-ugnayan sa doktor sa ITRMC o pagtawag sa 1553 para sa ligtas na gabay?")
                ],
                'sources': [
                    ("DSM-5-TR", "Major Depressive Disorder Diagnostic Criteria", "https://psychiatry.org", True),
                    ("WHO Mental Health Gap Action Programme (mhGAP)", "Depression Intervention Guide", "https://who.int", True)
                ]
            },
            {
                'term': 'Loneliness',
                'slug': 'loneliness',
                'term_fil': 'Pangungulila (Loneliness)',
                'category': categories_map['interpersonal-experiences'],
                'term_type': 'psychological',
                'short_definition': 'The painful subjective feeling that your existing social connections do not meet your psychological need for closeness and belonging.',
                'short_definition_fil': 'Masakit na pakiramdam ng kawalan ng malalim na koneksyon o pag-unawa mula sa ibang tao.',
                'detailed_definition': 'Loneliness is distinct from being physically alone. One can feel profoundly lonely in a crowded room if there is a perceived lack of meaningful intimacy.',
                'detailed_definition_fil': 'Maaari kang makaramdam ng pangungulila kahit napapaligiran ka ng maraming tao kung pakiramdam mo ay walang tunay na nakakakilala sa iyo.',
                'in_simpler_terms': 'Feeling unseen or emotionally isolated, wishing you had someone who truly understands your inner world.',
                'in_simpler_terms_fil': 'Pangungulila sa taong tunay na makauunawa sa nararamdaman mo nang walang paghuhusga.',
                'examples': [
                    ("Sitting in a bustling classroom in San Fernando yet feeling like an invisible outsider.",
                     "Nasa gitna ng masiglang klase o pamilya ngunit pakiramdam mo ay dayuhan ka at nag-iisa.")
                ],
                'questions': [
                    ("Do you yearn for deeper emotional intimacy rather than just more people around you?",
                     "Naghahanap ka ba ng mas tapat at malalim na pakikipag-usap?")
                ],
                'sources': [
                    ("Cacioppo & Patrick", "Loneliness: Human Nature and the Need for Social Connection", "", False)
                ]
            },
            {
                'term': 'Social Isolation',
                'slug': 'social-isolation',
                'term_fil': 'Pagkakabukod (Social Isolation)',
                'category': categories_map['interpersonal-experiences'],
                'term_type': 'psychological',
                'short_definition': 'An objective lack of contact and communication with family, friends, and the wider community.',
                'short_definition_fil': 'Pisikal at obhetibong kawalan ng pakikipag-ugnayan sa pamilya, kaibigan, o pamayanan.',
                'detailed_definition': 'Whereas loneliness is subjective distress, isolation is a measurable lack of social ties or interactions, often caused by illness, geographic distance, or withdrawal.',
                'detailed_definition_fil': 'Ang pananatili sa loob ng silid nang walang nakakausap na kahit sino sa loob ng maraming araw.',
                'in_simpler_terms': 'Actually having very few or no people to talk to or spend time with.',
                'in_simpler_terms_fil': 'Walang makausap o makasama dahil sa layo o sadyang pananatili nang mag-isa.',
                'examples': [
                    ("Remaining inside your bedroom without speaking to family or peers for several days.",
                     "Hindi lumalabas ng kwarto at hindi sumasagot sa mga tawag o mensahe sa loob ng mahabang panahon.")
                ],
                'questions': [
                    ("Are you physically spending days without speaking to anyone outside?",
                     "Ilang araw ka nang hindi nakikipag-usap o nakikisalamuha sa labas ng bahay?")
                ],
                'sources': []
            },
            {
                'term': 'Grounding',
                'slug': 'grounding',
                'term_fil': 'Pagpapakalma / Grounding',
                'category': categories_map['coping-and-regulation'],
                'term_type': 'psychological',
                'short_definition': 'Mindfulness and sensory strategies designed to anchor your awareness in the physical reality of the present moment.',
                'short_definition_fil': 'Mga simpleng paraan gamit ang paningin, pandinig, at pandama upang ibalik ang isip sa kasalukuyang sandali.',
                'detailed_definition': 'Grounding interrupts panic loops, flashbacks, and cognitive spirals by stimulating the senses, activating the parasympathetic nervous system.',
                'detailed_definition_fil': 'Pumuputol sa labis na kaba at pag-iisip sa pamamagitan ng pagtutok sa mga bagay na nakikita, naririnig, at nahihipo.',
                'in_simpler_terms': 'Using your five senses (what you see, touch, hear) to bring your frantic brain back into the calm room.',
                'in_simpler_terms_fil': 'Paggamit ng pandama—paghawak sa malamig na baso, pagbilang ng kulay sa paligid—upang kumalma.',
                'examples': [
                    ("Feeling your feet planted firmly on the floor and naming five green things in the room when your heart races.",
                     "Pagdama sa mga paa sa sahig at pagbilang ng limang bagay sa paligid kapag bumibilis ang tibok ng puso.")
                ],
                'questions': [
                    ("Can you notice the temperature of the air on your skin right now?",
                     "Nararamdaman mo ba ang simoy ng hangin sa iyong balat ngayon?")
                ],
                'sources': [
                    ("Najavits, L. M.", "Seeking Safety: Grounding Skills", "", False)
                ]
            },
            {
                'term': 'Rumination',
                'slug': 'rumination',
                'term_fil': 'Paulit-ulit na Pag-iisip (Rumination)',
                'category': categories_map['stress-and-anxiety'],
                'term_type': 'psychological',
                'short_definition': 'Repetitive, unproductive dwelling on the causes and consequences of past distress without taking constructive action.',
                'short_definition_fil': 'Paulit-ulit na pag-ikot ng isip sa mga nakaraang pagkakamali o suliranin nang walang nalilikhang solusyon.',
                'detailed_definition': 'Rumination traps the mind in a loop of "Why did this happen to me?" and "What if I failed?", exacerbating anxiety and depressive symptoms.',
                'detailed_definition_fil': 'Pag-ikot ng isip sa nakalipas na kahihiyan o problema, na nagpapatagal lamang sa sama ng loob.',
                'in_simpler_terms': 'Like a broken record in your head replaying an awkward or painful event over and over.',
                'in_simpler_terms_fil': 'Parang sirang plaka sa isip na paulit-ulit na nagpapatugtog ng mga alalahanin at pagkakamali.',
                'examples': [
                    ("Lying awake until 3 AM replaying a misunderstanding from two days ago.",
                     "Gising hanggang madaling araw kakaisip sa isang nasabing salita sa kaklase noong nakaraang araw.")
                ],
                'questions': [
                    ("Is this train of thought helping you find a solution, or simply making you feel heavier?",
                     "Nakatutulong ba ang paulit-ulit na pag-iisip, o lalo lang nitong pinapabigat ang loob mo?")
                ],
                'sources': [
                    ("Nolen-Hoeksema, S.", "Ruminative Responses to Depressed Mood", "Journal of Abnormal Psychology", False)
                ]
            },
            {
                'term': 'Self-Compassion',
                'slug': 'self-compassion',
                'term_fil': 'Kabaitan at Pag-unawa sa Sarili',
                'category': categories_map['self-perception'],
                'term_type': 'psychological',
                'short_definition': 'Treating yourself with the same kindness, care, and understanding that you would offer to a beloved friend during failure or suffering.',
                'short_definition_fil': 'Pagturing sa sarili nang may lambing, malasakit, at pag-unawa sa halip na malupit na pagpuna kapag nagkakamali.',
                'detailed_definition': 'Composed of self-kindness versus self-judgment, common humanity versus isolation, and mindfulness versus over-identification with flaws.',
                'detailed_definition_fil': 'Pagtanggap na ang pagkakamali at kahinaan ay normal na bahagi ng pagiging tao, hindi patunay na wala kang kwenta.',
                'in_simpler_terms': 'Talking to yourself like a caring friend would, especially when you make a mistake.',
                'in_simpler_terms_fil': 'Pakikipag-usap sa sarili nang may respeto at malasakit kapag may nasirang plano.',
                'examples': [
                    ("Saying to yourself: 'It makes sense that I made a mistake, I have been under immense pressure,' instead of calling yourself useless.",
                     "Pagsasabi sa sarili: 'Tao lang ako, pagod ako ngayon kaya nagkamali ako,' sa halip na laitin ang sarili.")
                ],
                'questions': [
                    ("What would you say right now to your closest friend if they were in your exact shoes?",
                     "Ano ang sasabihin mo sa matalik mong kaibigan kung siya ang nasa kalagayan mo ngayon?")
                ],
                'sources': [
                    ("Neff, Kristin D.", "Self-Compassion: An Alternative Conceptualization of a Healthy Attitude Toward Oneself", "", False)
                ]
            },
            {
                'term': 'Boundaries',
                'slug': 'boundaries',
                'term_fil': 'Malusog na Hangganan (Healthy Boundaries)',
                'category': categories_map['interpersonal-experiences'],
                'term_type': 'psychological',
                'short_definition': 'Clear physical, emotional, and mental limits that protect your well-being and delineate where your responsibilities end and others begin.',
                'short_definition_fil': 'Malinaw na hangganan sa sarili at sa iba upang maprotektahan ang kapayapaan ng isip at lakas.',
                'detailed_definition': 'Healthy boundaries are not walls to keep people out, but guidelines that allow genuine connection without resentment or emotional exploitation.',
                'detailed_definition_fil': 'Hindi ito pagtataboy sa iba, kundi pagtatakda kung anong kaya at hindi kayang ibigay nang bukal sa loob.',
                'in_simpler_terms': 'Knowing when to say "no" politely so that your "yes" can be genuine and not rooted in fear.',
                'in_simpler_terms_fil': 'Pagkakaroon ng lakas ng loob na tumanggi nang maayos upang hindi ka maubos sa kakabigay sa iba.',
                'examples': [
                    ("Politely declining an extra project during exam week to protect your sleep schedule.",
                     "Maayos na pagtanggi sa karagdagang pabor kapag tambak na ang iyong sariling mga gawain.")
                ],
                'questions': [
                    ("Are you saying yes out of fear of conflict, even when it harms your health?",
                     "Pumapayag ka ba dahil lang sa takot magalit ang iba, kahit ikaw na ang nahihirapan?")
                ],
                'sources': []
            }
        ]

        terms_map = {}
        for tdata in terms_data:
            examples = tdata.pop('examples', [])
            questions = tdata.pop('questions', [])
            sources = tdata.pop('sources', [])
            
            term, created = Term.objects.update_or_create(
                slug=tdata['slug'],
                defaults=tdata
            )
            terms_map[term.slug] = term

            # Examples
            term.examples.all().delete()
            for sit_en, sit_fil in examples:
                TermExample.objects.create(term=term, situation=sit_en, situation_fil=sit_fil)

            # Questions
            term.reflection_questions.all().delete()
            for q_en, q_fil in questions:
                ReflectionQuestion.objects.create(term=term, question=q_en, question_fil=q_fil)

            # Sources
            term.sources.all().delete()
            for title, citation, url, is_clin in sources:
                SourceReference.objects.create(
                    term=term, title=title, citation=citation, url=url, is_clinical_reference=is_clin
                )

        # 3. Explicit Curated Relationships
        relationships = [
            ('burnout', 'chronic-stress', 'related_to',
             'Burnout develops over time as a direct consequence of unmanaged chronic stress.',
             'Ang burnout ay nabubuo bunga ng matagalang stress na hindi nabigyan ng lunas o pahinga.'),
            ('burnout', 'temporary-tiredness', 'different_from',
             'Temporary tiredness recovers with a good sleep; burnout persists even after resting because emotional and motivational reserves are depleted.',
             'Ang pansamantalang pagod ay nawawala sa tulog; ang burnout ay nananatili dahil ubos ang emosyonal na lakas.'),
            ('burnout', 'overwhelm', 'often_associated_with',
             'Chronic overwhelm frequently precedes burnout as sustained high demands wear down resilience.',
             'Ang patuloy na pagka-overwhelm ang kadalasang nagiging dahilan ng tuluyang burnout.'),
            ('sadness', 'depression', 'different_from',
             'Sadness is a transient, healthy emotional reaction to pain; depression is an enduring clinical disorder causing persistent numbness, worthlessness, and functional impairment.',
             'Ang kalungkutan ay pansamantalang damdamin; ang depresyon ay mas malalim na medikal na kalagayan na tumatagal ng linggo at pumipigil sa pamumuhay.'),
            ('loneliness', 'social-isolation', 'different_from',
             'Loneliness is the painful subjective ache of feeling disconnected; social isolation is the objective physical absence of social contact.',
             'Ang pangungulila ay damdamin ng kakulangan sa malalim na koneksyon; ang isolation ay pisikal na kawalan ng kasama.'),
            ('rumination', 'chronic-stress', 'can_contribute_to',
             'Continually replaying distressing thoughts triggers continuous stress responses in the body.',
             'Ang paulit-ulit na pag-ikot ng negatibong isip ay nagpapanatili ng mataas na stress sa katawan.'),
            ('grounding', 'rumination', 'opposite_of',
             'Grounding anchors you in the sensory present, directly breaking the mental spiral of rumination.',
             'Ang grounding ay humihila sa iyo pabalik sa kasalukuyan, pumuputol sa paulit-ulit na pag-aalala.'),
            ('self-compassion', 'burnout', 'opposite_of',
             'Cultivating self-compassion helps prevent and heal burnout by moderating perfectionism and permitting rest.',
             'Ang malasakit sa sarili ay panangga sa burnout dahil tinutulungan ka nitong magpahinga nang walang kasalanan.')
        ]

        for s_slug, t_slug, rel_type, exp_en, exp_fil in relationships:
            if s_slug in terms_map and t_slug in terms_map:
                TermRelationship.objects.update_or_create(
                    source_term=terms_map[s_slug],
                    target_term=terms_map[t_slug],
                    relationship_type=rel_type,
                    defaults={
                        'explanation': exp_en,
                        'explanation_fil': exp_fil,
                        'editorial_review_status': 'approved'
                    }
                )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {len(categories_map)} categories, {len(terms_map)} terms, and curated explicit relationships!"
        ))
