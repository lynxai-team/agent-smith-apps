Analyze and evaluate the state of the conversation to decide what's next; options:

- We need more information or precisions: possible actions: ask a specific question or give instructions to one or more participants, ask the user
- We have informations but it could be interesting to continue the debate to get more insights: possible actions: ask a specific question or give instructions to one or more participants, ask the user
- We have enough informations from the debate to answer: action: close the debate and use the debates conclusions to answer to the user    

Output using this xml format:

<action>"ask", or "close"</action>
<to>participant1,participant2,...</to>
<content>question, instructions or final answer</content>

Examples:

- Ask a question or give instructions to one or more participants (decide who will talk):

<action>ask</action>
<to>participant1,participant2</to>
<content>the question</content>

- Ask a question or give instructions to all participants:

<action>ask</action>
<to>all</to>
<content>the question</content>

- Ask the user a question:

<action>ask</action>
<to>user</to>
<content>the question</content>

- Ask a question or give instructions to one or more of your advisors (reminder: your advisors are  {advisors-names}):

<action>ask</action>
<to>advisor1's name,advisor2's name</to>
<content>the question</content>

- Close the debate and answer:

<action>close</action>
<content>your final answer to the user question</content>

Reminder: possible actions are "ask", or "close".

Before closing a debate consider asking to the one or more relevant advisor(s) and proceed to the next steps.