// Generated from the approved question_bank.json.
module.exports = {
  "version": "romantic16-v0.1-unvalidated",
  "status": "原创文学原型探索问卷；未进行真人信效度验证。数值参数均为待校准的工程默认值。",
  "audience": "初版拟面向18岁及以上中文读者；其他语言或人群需重新检验。",
  "disclaimer": "不是临床诊断、职业甄选工具或MBTI官方测评。16型不是已经证实存在的自然人格类别。",
  "count": {
    "anchors": 15,
    "core_scenes": 8,
    "adaptive_min": 2,
    "adaptive_max": 4,
    "total_min": 25,
    "total_max": 27
  },
  "instructions": {
    "intro": "请按最近半年大多数时候的自己回答，不按理想中的自己。情境题问的是你通常会怎样选择，不是哪种做法更好。没经历过时可按最接近的经历判断，也可以跳过。",
    "anchor_response": [
      "很不像我",
      "比较不像我",
      "介于两者之间",
      "比较像我",
      "很像我"
    ],
    "missing_label": "无从判断／不想回答",
    "scene_response": "每题先选最像自己的一项，再从其余三项中选最不像自己的一项。这里只比较这四项，不代表你完全认同或完全否定它们。",
    "pair_response": [
      "更接近A",
      "更接近B",
      "两者差不多",
      "都不符合／无从判断"
    ]
  },
  "dimensions": {
    "E": "外向性线索",
    "A": "宜人性线索",
    "C": "尽责性线索",
    "N": "负性情绪反应线索",
    "O": "开放性线索"
  },
  "anchors": [
    {
      "id": "T01",
      "dimension": "E",
      "key": 1,
      "text": "和不太熟悉的人相处时，我常主动开启话题。"
    },
    {
      "id": "T02",
      "dimension": "C",
      "key": 1,
      "text": "开始一项重要任务前，我通常先安排步骤。"
    },
    {
      "id": "T03",
      "dimension": "A",
      "key": 1,
      "text": "发现别人为难时，我常主动问对方需要什么。"
    },
    {
      "id": "T04",
      "dimension": "N",
      "key": 1,
      "text": "事情还没有结果时，我容易反复担心可能出的问题。"
    },
    {
      "id": "T05",
      "dimension": "O",
      "key": 1,
      "text": "遇到陌生的事物，我常想进一步弄懂它。"
    },
    {
      "id": "T06",
      "dimension": "E",
      "key": -1,
      "text": "连续和人相处一段时间后，我更想独处，而不是继续社交。"
    },
    {
      "id": "T07",
      "dimension": "C",
      "key": 1,
      "text": "即使一件事已经没那么有趣，我通常仍会完成答应的部分。"
    },
    {
      "id": "T08",
      "dimension": "A",
      "key": 1,
      "text": "别人给出合理解释时，我通常愿意先相信。"
    },
    {
      "id": "T09",
      "dimension": "N",
      "key": 1,
      "text": "计划突然被打乱后，我的情绪往往需要一段时间才能恢复。"
    },
    {
      "id": "T10",
      "dimension": "O",
      "key": 1,
      "text": "文字、音乐或画面中的细微变化，很容易引起我的注意。"
    },
    {
      "id": "T11",
      "dimension": "E",
      "key": 1,
      "text": "一群人都在等待时，我通常愿意先提出下一步怎么做。"
    },
    {
      "id": "T12",
      "dimension": "C",
      "key": -1,
      "text": "做事时，我常边做边决定下一步，而不是预先排好顺序。"
    },
    {
      "id": "T13",
      "dimension": "A",
      "key": -1,
      "text": "发生分歧时，我常直接指出问题，不太顾及话听起来是否生硬。"
    },
    {
      "id": "T14",
      "dimension": "N",
      "key": -1,
      "text": "遇到小挫折后，我一般能较快回到原来的状态。"
    },
    {
      "id": "T15",
      "dimension": "O",
      "key": -1,
      "text": "比起探索陌生想法，我更愿意反复接触已经喜欢的内容。"
    }
  ],
  "core_scenes": [
    {
      "id": "S1",
      "context": "协作开局",
      "stem": "你和几个人共同办一场小活动，意见迟迟统一不了。你通常先做什么？",
      "options": [
        {
          "id": "S1-FREE",
          "type": "FREE",
          "text": "划清自己负责的部分，由自己决定怎么做。"
        },
        {
          "id": "S1-FIRE",
          "type": "FIRE",
          "text": "提出我认为更值得共同投入的方向，并争取大家支持。"
        },
        {
          "id": "S1-DARE",
          "type": "DARE",
          "text": "找一个低成本版本，先试做再决定。"
        },
        {
          "id": "S1-PLAY",
          "type": "PLAY",
          "text": "换个轻松的玩法，让讨论重新动起来。"
        }
      ]
    },
    {
      "id": "S2",
      "context": "维系关系",
      "stem": "你在乎的人接下来会很忙。你最多能每周留出一晚维系关系。你更愿意怎样使用这段时间？",
      "options": [
        {
          "id": "S2-LOVE",
          "type": "LOVE",
          "text": "认真分享彼此的感受，确认彼此是否仍然靠近。"
        },
        {
          "id": "S2-OATH",
          "type": "OATH",
          "text": "守住之前约好的相处，不因最近聊得少就改变。"
        },
        {
          "id": "S2-CARE",
          "type": "CARE",
          "text": "先看对方目前最需要什么，再安排这段时间。"
        },
        {
          "id": "S2-HOME",
          "type": "HOME",
          "text": "形成固定的小习惯，让彼此的生活稳定相连。"
        }
      ]
    },
    {
      "id": "S3",
      "context": "面对未知",
      "stem": "你要推进一个不熟悉的小项目，准备时间有限。你通常优先做什么？",
      "options": [
        {
          "id": "S3-RULE",
          "type": "RULE",
          "text": "确认共同规则和各自责任。"
        },
        {
          "id": "S3-PLAN",
          "type": "PLAN",
          "text": "排清目标、步骤和备用方案。"
        },
        {
          "id": "S3-MASK",
          "type": "MASK",
          "text": "弄清参与者在意什么，再决定怎样沟通。"
        },
        {
          "id": "S3-MIND",
          "type": "MIND",
          "text": "找到运作原理，弄懂关键的未知点。"
        }
      ]
    },
    {
      "id": "S4",
      "context": "独处时刻",
      "stem": "一个没有必须完成任务的晚上，你通常最想把注意力放在哪里？",
      "options": [
        {
          "id": "S4-MUSE",
          "type": "MUSE",
          "text": "把感受做成一点东西，如文字、图片或自己的小布置。"
        },
        {
          "id": "S4-MIST",
          "type": "MIST",
          "text": "想想最近的生活，是不是自己真正想要的。"
        },
        {
          "id": "S4-VEIL",
          "type": "VEIL",
          "text": "整理暂时不想让人知道的感受，不急着对外表达。"
        },
        {
          "id": "S4-WINE",
          "type": "WINE",
          "text": "挑一件能直接带来快乐的小事，尽兴地享受。"
        }
      ]
    },
    {
      "id": "S5",
      "context": "修改作品",
      "stem": "你和别人合作做一个小作品，大家建议改动你很在意的一部分。你最先确认什么？",
      "options": [
        {
          "id": "S5-FREE",
          "type": "FREE",
          "text": "最后这个选择，是否仍由我自己作出。"
        },
        {
          "id": "S5-LOVE",
          "type": "LOVE",
          "text": "这次沟通中，我的感受是否被认真理解。"
        },
        {
          "id": "S5-RULE",
          "type": "RULE",
          "text": "之前商定的标准，对每个人是否一样。"
        },
        {
          "id": "S5-MUSE",
          "type": "MUSE",
          "text": "改完以后，是否还能表达我真正想说的东西。"
        }
      ]
    },
    {
      "id": "S6",
      "context": "继续还是退出",
      "stem": "一件投入数周的事情开始变得吃力，也允许退出。什么最可能让你继续？",
      "options": [
        {
          "id": "S6-FIRE",
          "type": "FIRE",
          "text": "它能改善一个我认为值得改变的问题。"
        },
        {
          "id": "S6-OATH",
          "type": "OATH",
          "text": "我已经向某个重要的人作出了承诺。"
        },
        {
          "id": "S6-PLAN",
          "type": "PLAN",
          "text": "它仍然通向我事先选定的长期目标。"
        },
        {
          "id": "S6-MIST",
          "type": "MIST",
          "text": "我还没有弄清，它对我到底意味着什么。"
        }
      ]
    },
    {
      "id": "S7",
      "context": "初入新群体",
      "stem": "你进入一个新的合作小组，第一周没有紧急任务。你更可能先做什么？",
      "options": [
        {
          "id": "S7-DARE",
          "type": "DARE",
          "text": "主动试一个自己没有做过的小任务。"
        },
        {
          "id": "S7-CARE",
          "type": "CARE",
          "text": "找到别人需要帮助的地方，搭把手。"
        },
        {
          "id": "S7-MASK",
          "type": "MASK",
          "text": "观察各人的关注点，再调整自己的沟通方式。"
        },
        {
          "id": "S7-VEIL",
          "type": "VEIL",
          "text": "保持友善，但先不谈自己的私人想法。"
        }
      ]
    },
    {
      "id": "S8",
      "context": "共享闲暇",
      "stem": "你和熟悉的人临时空出两小时。几种安排都方便，花费也差不多。你更愿意？",
      "options": [
        {
          "id": "S8-PLAY",
          "type": "PLAY",
          "text": "一起玩点即兴的东西，看看能发生什么。"
        },
        {
          "id": "S8-HOME",
          "type": "HOME",
          "text": "延续熟悉的小习惯，舒服地待在一起。"
        },
        {
          "id": "S8-MIND",
          "type": "MIND",
          "text": "围绕一个好奇的问题，聊透或试明白。"
        },
        {
          "id": "S8-WINE",
          "type": "WINE",
          "text": "选喜欢的食物或娱乐，享受当下。"
        }
      ]
    }
  ],
  "core_order": [
    "S1",
    "S5",
    "S2",
    "S6",
    "S3",
    "S7",
    "S4",
    "S8"
  ],
  "adaptive": {
    "cost_stem": "在一件对你重要、又不能面面俱到的事情里，你更愿意承担哪一种代价？请按自己通常真的会做的选择回答。",
    "behavior_stem": "回想最近半年，下面哪种做法在你身上更经常发生？请选择真实发生较多的，而不是更值得赞赏的。",
    "cost_options": {
      "FREE": "自己作主，但少一些现成的支持。",
      "FIRE": "推动认同的改变，但可能遭到反对。",
      "DARE": "先试一条新路，但可能有一段白忙。",
      "PLAY": "保留即兴空间，但少一些确定性。",
      "LOVE": "坦诚表达在乎，但可能得不到同等回应。",
      "OATH": "守住承诺，但减少临时改选的余地。",
      "CARE": "回应别人的需要，但推迟自己的一些安排。",
      "HOME": "保住可靠的日常，但错过一点新鲜机会。",
      "RULE": "坚持共同标准，但少一些变通空间。",
      "PLAN": "保留长期安排，但放弃眼下的一次诱惑。",
      "MASK": "调整表达方式，但不能每次都直说全部想法。",
      "MIND": "先弄懂再推进，但进度可能慢一点。",
      "MUSE": "保留真实表达，但未必讨多数人喜欢。",
      "MIST": "给意义问题留出时间，但暂时没有明确答案。",
      "VEIL": "保留内心的隐私，但别人可能更难接近。",
      "WINE": "享受一次当下的快乐，但少完成一项非必要安排。"
    },
    "behavior_options": {
      "FREE": "重要选择上，即使意见不同，我仍按自己的判断来。",
      "FIRE": "为改善共同参与的事情，我主动说服或组织过别人。",
      "DARE": "没有完整把握时，我也动手尝试过新事情。",
      "PLAY": "我临时换过玩法，让原本沉闷的气氛活跃起来。",
      "LOVE": "我先表达过自己的在乎，希望对方也作出回应。",
      "OATH": "即使麻烦增加，我仍履行了对某个特定人的承诺。",
      "CARE": "我实际腾出时间，帮助别人解决过具体困难。",
      "HOME": "我持续维持一些日常安排，让生活保持安稳。",
      "RULE": "有人希望破例时，我仍要求按事先同意的标准来。",
      "PLAN": "为了较远的目标，我放弃过一次即时满足。",
      "MASK": "我根据对象不同，调整过说法和展示自己的方式。",
      "MIND": "遇到不懂的东西，即使暂时用不上，我也追查过它的机制。",
      "MUSE": "我把某种感受，变成了自己认可的表达或作品。",
      "MIST": "我专门留过时间反思想要的生活，而不急着下结论。",
      "VEIL": "即使信任某个人，我仍少让对方知道自己的脆弱。",
      "WINE": "我主动为普通的一天，安排过具体的小享受。"
    },
    "contrasts": [
      {
        "id": "D01",
        "a": "FREE",
        "b": "FIRE",
        "stem": "某个不合理的合作安排已经不再限制你，但仍影响其他人。继续推动改变需要额外时间。你更接近哪一种？",
        "a_text": "我的选择权恢复后，通常会把时间用回自己的事。",
        "b_text": "即使自己不再受影响，我通常仍想推动共同改变。"
      },
      {
        "id": "D02",
        "a": "DARE",
        "b": "PLAY",
        "stem": "你想打破一段单调的生活，空出的时间只能选一种。哪种更像你通常的选择？",
        "a_text": "尝试一个没做过、需要边做边学的小挑战。",
        "b_text": "和熟悉的人即兴玩点东西，不必有明确成果。"
      },
      {
        "id": "D03",
        "a": "PLAY",
        "b": "WINE",
        "stem": "同样轻松、方便的一次休息，你更可能选择哪种？",
        "a_text": "玩一个结果未知、过程可以不断变化的新花样。",
        "b_text": "享受已经知道自己喜欢的食物、氛围或娱乐。"
      },
      {
        "id": "D04",
        "a": "LOVE",
        "b": "OATH",
        "stem": "你与重要的人最近相处平淡，也没有明显冲突。哪一件事更牵动你？",
        "a_text": "我们是否仍愿意表达感受，并真诚回应彼此。",
        "b_text": "我们是否仍能履行约定，在需要时彼此可靠。"
      },
      {
        "id": "D05",
        "a": "OATH",
        "b": "CARE",
        "stem": "两个请求都合理、耗时相近，暂时不能兼顾。你通常更难放下哪一个？",
        "a_text": "先前已经向一个重要的人答应过的请求。",
        "b_text": "此刻更需要帮助的人提出的请求。"
      },
      {
        "id": "D06",
        "a": "CARE",
        "b": "HOME",
        "stem": "连续几周都只有一点额外时间。两种做法都有价值，你通常会先保住哪种？",
        "a_text": "根据身边人的新需要，灵活提供帮助。",
        "b_text": "维持自己和亲近的人已经建立的安稳日常。"
      },
      {
        "id": "D07",
        "a": "RULE",
        "b": "PLAN",
        "stem": "出现一种规则允许的新做法，可能更快达成目标，但会改变大家原先共同采用的标准。你通常先做什么？",
        "a_text": "先重新确认共同标准，避免同类事情处理不一致。",
        "b_text": "先评估目标和代价，合适就推动调整做法。"
      },
      {
        "id": "D08",
        "a": "PLAN",
        "b": "MIND",
        "stem": "你找到一种有效办法，但还没有完全弄懂原理。没有安全风险，时间也有限。你通常更倾向？",
        "a_text": "先用它推进既定目标，需要时再补原理。",
        "b_text": "再花一些时间理解原理，哪怕暂时少推进一点。"
      },
      {
        "id": "D09",
        "a": "PLAN",
        "b": "MASK",
        "stem": "合作突然卡住，你只能先查一件事。哪种更接近你通常的第一反应？",
        "a_text": "目标、步骤、资源之间，究竟哪一环出了问题。",
        "b_text": "各个人在意什么，为什么没有按表面说法行动。"
      },
      {
        "id": "D10",
        "a": "MUSE",
        "b": "MIST",
        "stem": "一种说不清的感受停留了几天，你有一点独处时间。你通常更倾向？",
        "a_text": "尝试把它变成一段文字、一张图或其他表达。",
        "b_text": "继续理解它与自己的生活有什么关系，不急着形成作品。"
      },
      {
        "id": "D11",
        "a": "FREE",
        "b": "VEIL",
        "stem": "在一段可信赖的关系中，下面哪一种要求通常更让你不舒服？",
        "a_text": "重要决定需要先得到对方同意。",
        "b_text": "需要讲出自己还没准备分享的脆弱感受。"
      },
      {
        "id": "D12",
        "a": "LOVE",
        "b": "VEIL",
        "stem": "你很在乎一个人，对方没有伤害你的迹象，但关系还不够明确。你通常更接近？",
        "a_text": "先让对方知道我的在乎，接受回应尚不确定。",
        "b_text": "先确认对方的态度，再透露自己有多在乎。"
      }
    ]
  },
  "parameters": {
    "ridge_lambda": 1.0,
    "core_weight": 1.0,
    "adaptive_weight": 1.0,
    "equal_response_weight": 0.5,
    "clear_margin": 0.5,
    "loo_retention": 0.8,
    "dual_third_margin": 0.25,
    "min_valid_core": 6,
    "min_support_contexts": 2,
    "tie_epsilon": 1e-08
  },
  "sources": [
    {
      "title": "Reinterpreting the Myers-Briggs Type Indicator From the Perspective of the Five-Factor Model of Personality",
      "authors": "McCrae & Costa",
      "year": 1989,
      "doi": "10.1111/j.1467-6494.1989.tb00759.x"
    },
    {
      "title": "Short and extra-short forms of the Big Five Inventory–2: The BFI-2-S and BFI-2-XS",
      "authors": "Soto & John",
      "year": 2017,
      "doi": "10.1016/j.jrp.2017.02.004"
    },
    {
      "title": "An Overview of the Schwartz Theory of Basic Values",
      "authors": "Schwartz",
      "year": 2012,
      "doi": "10.9707/2307-0919.1116"
    },
    {
      "title": "The Effects of Response Instructions on Situational Judgment Test Performance and Validity in a High-Stakes Context",
      "authors": "Lievens, Sackett & Buyse",
      "year": 2009,
      "url": "https://www.researchgate.net/publication/26663123_The_Effects_of_Response_Instructions_on_Situational_Judgment_Test_Performance_and_Validity_in_a_High-Stakes_Context"
    },
    {
      "title": "Some probabilistic models of best, worst, and best–worst choices",
      "authors": "Marley & Louviere",
      "year": 2005,
      "url": "https://www.sciencedirect.com/science/article/abs/pii/S0022249605000441"
    },
    {
      "title": "On the Statistical and Practical Limitations of Thurstonian IRT Models",
      "authors": "Bürkner, Schulte & Holling",
      "year": 2019,
      "doi": "10.1177/0013164419832063"
    },
    {
      "title": "Comparing Countdown- and IRT-Based Approaches to Computerized Adaptive Personality Testing",
      "authors": "Rudick, Yam & Simms",
      "year": 2013,
      "doi": "10.1037/a0032541"
    },
    {
      "title": "The fallacy of personal validation; a classroom demonstration of gullibility",
      "authors": "Forer",
      "year": 1949,
      "doi": "10.1037/h0059240"
    }
  ],
  "types": [
    {
      "code": "FREE",
      "name": "不驯者",
      "motive": "自主选择",
      "literary_prototype": "印第安娜"
    },
    {
      "code": "FIRE",
      "name": "举旗者",
      "motive": "推动共同改变",
      "literary_prototype": "自由的女性寓言形象"
    },
    {
      "code": "DARE",
      "name": "闯局者",
      "motive": "探索与尝试",
      "literary_prototype": "达达尼昂"
    },
    {
      "code": "PLAY",
      "name": "戏谑者",
      "motive": "即兴与玩心",
      "literary_prototype": "伽弗洛什"
    },
    {
      "code": "LOVE",
      "name": "赤心者",
      "motive": "情感交流与回应",
      "literary_prototype": "爱斯梅拉达"
    },
    {
      "code": "OATH",
      "name": "守誓者",
      "motive": "特定关系中的承诺",
      "literary_prototype": "卡西莫多"
    },
    {
      "code": "CARE",
      "name": "托举者",
      "motive": "回应他人的需要",
      "literary_prototype": "冉阿让"
    },
    {
      "code": "HOME",
      "name": "筑巢者",
      "motive": "可靠的日常与归属",
      "literary_prototype": "热尔曼"
    },
    {
      "code": "RULE",
      "name": "执律者",
      "motive": "一致的标准",
      "literary_prototype": "沙威"
    },
    {
      "code": "PLAN",
      "name": "布局者",
      "motive": "长期目标与安排",
      "literary_prototype": "基督山伯爵"
    },
    {
      "code": "MASK",
      "name": "面具师",
      "motive": "读懂人并调整呈现",
      "literary_prototype": "米莱迪"
    },
    {
      "code": "MIND",
      "name": "解谜者",
      "motive": "理解机制",
      "literary_prototype": "法里亚神父"
    },
    {
      "code": "MUSE",
      "name": "造境者",
      "motive": "真实表达与创造",
      "literary_prototype": "康素爱萝"
    },
    {
      "code": "MIST",
      "name": "漂泊者",
      "motive": "探索生活的意义",
      "literary_prototype": "勒内"
    },
    {
      "code": "VEIL",
      "name": "藏心者",
      "motive": "保护尚未准备公开的内心",
      "literary_prototype": "卡米耶"
    },
    {
      "code": "WINE",
      "name": "尽兴者",
      "motive": "具体的当下享受",
      "literary_prototype": "波尔托斯"
    }
  ]
};
