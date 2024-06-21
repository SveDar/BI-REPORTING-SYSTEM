import pandas as pd
from pandasai import SmartDataframe
from langchain_groq.chat_models import ChatGroq
from langchain_community.llms import Ollama 
import sqlite3
import os
import sys

#source .venv/bin/activate
#python app.py


import os
from groq import Groq

client = Groq(
    # This is the default and can be omitted
    api_key="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",
)



f = open("../views/public/csv_collection/flag.txt", "r")
string = (f.read())
while True:

    f = open("../views/public/csv_collection/flag.txt", "r")
    st = (f.read())

    if string != st:
    


        
        llm = ChatGroq(model_name="llama3-70b-8192", api_key = "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")
        #export GROQ_API_KEY=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



        # N1 CashFlow
        df = pd.read_csv('../views/public/csv_collection/cashflow_per_period.csv')
        print(df)
        df = SmartDataframe(df, config={"llm": llm})
        cashflow_per_period_question = """you are a consultant!
        i want in text format analis about the data based on that meaning of each column:
        These terms appear to be related to credit lending and financial transactions. Here's a brief explanation of each:

        Request: This refers to the amount of money requested by a borrower from a lender. It's the initial amount that the borrower is seeking to borrow.
        Lended Amount: This is the amount of money that the lender agrees to lend to the borrower. It's the actual amount of money that is disbursed to the borrower.
        Repaid Amount: This is the amount of money that the borrower repays to the lender. It's the amount of money that the borrower has paid back to the lender, either partially or fully.
        These three terms are often used in the context of credit lending, such as:

        Personal loans
        Mortgage loans
        Credit card transactions
        Small business loans
        Here's an example of how these terms might be used:

        A borrower requests a loan of $10,000 to purchase a new car.
        The lender agrees to lend the borrower $8,000, which is the Lended Amount.
        The borrower repays $2,000 of the loan, which is the Repaid Amount.
        In this example, the Request is 10,000, the Lended Amount is 8,000, and the Repaid Amount is $2,000.

        Locked Amount:

        In some cases, a Locked Amount refers to the amount of money that is set aside or "locked" by the lender for a specific purpose, such as:
        Collateral: The lender may require the borrower to provide collateral, such as a property or asset, to secure the loan. The Locked Amount would be the value of the collateral.
        Reserve: The lender may set aside a portion of the loan amount as a reserve, which is not disbursed to the borrower. The Locked Amount would be the amount of the reserve.
        In summary, the Request is the initial amount requested by the borrower, the Lended Amount is the actual amount disbursed by the lender, and the Repaid Amount is the amount repaid by the borrower. The Locked Amount refers to the amount of money set aside or "locked" by the lender for a specific purpose.
        At the end i want an advice from you"""
        cashflow_per_period_answer = ( df.chat(cashflow_per_period_question))
        #print( cashflow_per_period_answer)



        # N2 Contract
        df = pd.read_csv('../views/public/csv_collection/contract_per_period.csv')
        df = SmartDataframe(df, config={"llm": llm})
        contract_per_period_question = """you are a consultant!
        i want in text format analis about the data based on that meaning of each column: Here's a brief explanation of each:

        Opened_Contract_Rate: This refers to the interest rate or fee charged by a lender when a new loan contract is opened or initiated.
        Closed_Contract_Rate: This refers to the interest rate or fee charged by a lender when a loan contract is closed or terminated.
        Refinanced_Rate: This refers to the interest rate or fee charged by a lender when a borrower refinances an existing loan.
        Paid-off_Rate: This refers to the percentage of borrowers who have paid off their loans.
        Cession_Rate: This term is often used in the context of credit risk assessment and refers to the rate at which borrowers default on their loans.
        Court_Rate: This term is often used in the context of credit litigation and refers to the rate at which borrowers are taken to court for non-payment.
        So based on that i want overall summary for each parammeter from the data 

        The counts of each parameter can provide valuable insights into the credit lending process. Here are some possible interpretations:
        Opened_Contract_Rate: A high Opened_Contract_Rate may indicate that lenders are charging higher interest rates for new loans.
        Closed_Contract_Rate: A high Closed_Contract_Rate may indicate that lenders are charging higher interest rates for loan terminations.
        Refinanced_Rate: A high Refinanced_Rate may indicate that borrowers are refinancing their loans at higher interest rates.
        Paid-off_Rate: A high Paid-off_Rate may indicate that borrowers are repaying their loans at a higher rate.
        Cession_Rate: A high Cession_Rate may indicate a high risk of default or a high likelihood of borrowers defaulting on their loans.
        Court_Rate: A high Court_Rate may indicate a high rate of litigation or a high rate of borrowers being taken to court for non-payment.
        So based on that i want overall opinion on the data 

        At the end i want an advice from you"""
        contract_per_period_answer = ( df.chat(contract_per_period_question))
        #print( ">>>>>>>>>>contract_per_period_answer<<<<<<<<<<")
        #print( contract_per_period_answer)
        #print( ">>>>>>>>>>contract_per_period_answer<<<<<<<<<<")





        df = pd.read_csv('../views/public/csv_collection/applications_per_period.csv')
        df = SmartDataframe(df, config={"llm": llm})
        applications_per_period_question = """you are a consultant!
        i want in text format analis about the data based on that meaning of each column:
        Reject_Rate: The percentage of loan applications that are rejected by lenders due to various reasons such as poor credit history, insufficient income, or high debt-to-income ratio.
        Accept_Rate: The percentage of loan applications that are approved by lenders. This rate is often used to measure the lender's willingness to lend and the borrower's creditworthiness.
        Contract_Rate: The interest rate or fee charged by a lender for a loan or credit agreement. This rate is often used to calculate the borrower's monthly payments.
        Refinancing_Rate: The interest rate or fee charged by a lender when a borrower refinances an existing loan. This rate is often used to calculate the borrower's new monthly payments.
        New_Contract Rate: The rate at which new loan contracts are issued by lenders. This rate is often used to measure the lender's business volume and growth.
        NTU_Rate (Not to be Understood): This term is often used in the context of credit risk assessment and refers to the percentage of borrowers who default on their loans. NTU rate is often used to measure the creditworthiness of borrowers and the risk associated with lending to them.
        These rates are important metrics for lenders, investors, and regulators to understand the credit market, assess credit risk, and make informed decisions.
        At the end i want an advice from you"""
        applications_per_period_answer = ( df.chat(applications_per_period_question))
        #print( ">>>>>>>>>>applications_per_period_answer<<<<<<<<<<")
        #print( applications_per_period_answer)
        #print( ">>>>>>>>>>applications_per_period_answer<<<<<<<<<<")







        df = pd.read_csv('../views/public/csv_collection/applications_rate_per_period.csv')
        df = SmartDataframe(df, config={"llm": llm})
        applications_rate_per_period_question = """you are a consultant!
        i want in text format analis about the data based on that meaning of each column:
        Reject_Rate: The percentage of loan applications that are rejected by lenders due to various reasons such as poor credit history, insufficient income, or high debt-to-income ratio.
        Accept_Rate: The percentage of loan applications that are approved by lenders. This rate is often used to measure the lender's willingness to lend and the borrower's creditworthiness.
        Contract_Rate: The interest rate or fee charged by a lender for a loan or credit agreement. This rate is often used to calculate the borrower's monthly payments.
        Refinancing_Rate: The interest rate or fee charged by a lender when a borrower refinances an existing loan. This rate is often used to calculate the borrower's new monthly payments.
        New_Contract Rate: The rate at which new loan contracts are issued by lenders. This rate is often used to measure the lender's business volume and growth.
        NTU_Rate (Not to be Understood): This term is often used in the context of credit risk assessment and refers to the percentage of borrowers who default on their loans. NTU rate is often used to measure the creditworthiness of borrowers and the risk associated with lending to them.
        These rates are important metrics for lenders, investors, and regulators to understand the credit market, assess credit risk, and make informed decisions.
        At the end i want an advice from you"""
        applications_rate_per_period_answer = ( df.chat(applications_rate_per_period_question))
        #print( ">>>>>>>>>>applications_rate_per_period_answer<<<<<<<<<<")
        #print( applications_rate_per_period_answer)
        #print( ">>>>>>>>>>applications_rate_per_period_answer<<<<<<<<<<")




        df = pd.read_csv('../views/public/csv_collection/customer_behavior_per_period.csv')
        df = SmartDataframe(df, config={"llm": llm})
        customer_behavior_per_period_question = """you are a consultant!
        i want in text format analis about the data based on that meaning of each column:
        Good: This refers to the number of customers who have a good credit history and are considered low-risk borrowers.
        Bad: This refers to the number of customers who have a bad credit history and are considered high-risk borrowers.
        Good_rate: This refers to the percentage of customers who have a good credit history.
        Bad_rate: This refers to the percentage of customers who have a bad credit history.
        The counts of each parameter can provide valuable insights into the credit lending process. Here are some possible interpretations:

        Good: A high Good count may indicate that the lender is attracting a large number of low-risk borrowers.
        Bad: A high Bad count may indicate that the lender is attracting a large number of high-risk borrowers.
        Good_rate: A high Good_rate may indicate that the lender is approving a large percentage of loan applications from low-risk borrowers.
        Bad_rate: A high Bad_rate may indicate that the lender is approving a large percentage of loan applications from high-risk borrowers.

        At the end i want an advice from you"""
        customer_behavior_per_period_answer = ( df.chat(customer_behavior_per_period_question))
        #print( ">>>>>>>>>>applications_rate_per_period_answer<<<<<<<<<<")
        #print( customer_behavior_per_period_answer)
        #print( ">>>>>>>>>>applications_rate_per_period_answer<<<<<<<<<<")




        #use data, numbers and fhrases in human readable form!
        df = pd.read_csv('../views/public/csv_collection/geo_report.csv')
        df = SmartDataframe(df, config={"llm": llm})
        geo_report_question = """you are a consultant!


        Use that as example how to structure the answer!
        region structure: In region 18, the lender is approving a large number of loan applications from low-risk borrowers, with 402 good loans and a approval rate of 0.34%. The lender is also rejecting a relatively small number of loan applications from high-risk borrowers, with 21 bad loans and a rejection rate of 0.45%. The lender is granting a significant amount of money to borrowers in this region, with a total granted amount of 754454.41 and receiving a significant amount of repayment, with a total repaid amount of 211376.59. The lender is experiencing a relatively low rate of default in this region, with 31 non-performing units. 
        overall structure: Overall, the lender can use this information to identify trends in customer behavior and adjust their lending strategies accordingly, develop targeted marketing campaigns to attract more low-risk borrowers, implement stricter credit criteria to reduce the number of high-risk borrowers, and offer credit counseling or education programs to help high-risk borrowers improve their credit scores.', 'advice': '
        advice structure: Based on the analysis, I recommend that the lender focuses on identifying trends in customer behavior and adjusting their lending strategies accordingly. They should also develop targeted marketing campaigns to attract more low-risk borrowers and implement stricter credit criteria to reduce the number of high-risk borrowers. Additionally, the lender should consider offering credit counseling or education programs to help high-risk borrowers improve their credit scores.

        At the end i want an advice from you"""
        geo_report_answer = ( df.chat(geo_report_question))
        #print( ">>>>>>>>>>applications_rate_per_period_answer<<<<<<<<<<")
        #print( geo_report_answer)
        #print( ">>>>>>>>>>applications_rate_per_period_answer<<<<<<<<<<")



        chat_completion = client.chat.completions.create(
            messages=[{
                    "role": "user",
                    "content": cashflow_per_period_answer + "based on that act like credit consultant and give me informed advises about the region and potential investment and changing the text saving the numbers accurate to have less tautology constructed ass a report not a conversation",}],
            model="llama3-8b-8192",
        )
        cashflow_per_period_answer=(chat_completion.choices[0].message.content)


        chat_completion = client.chat.completions.create(
            messages=[{
                    "role": "user",
                    "content": contract_per_period_answer + "based on that act like credit consultant and give me informed answer about the contracts and potential risks also chane the text saving the numbers accurate to have less tautology constructed ass a report not a conversation",}],
            model="llama3-8b-8192",
        )
        contract_per_period_answer=(chat_completion.choices[0].message.content)

        chat_completion = client.chat.completions.create(
            messages=[{
                    "role": "user",
                    "content": applications_per_period_answer + "based on that act like credit consultant and give me informed answer about the data and the applications, for what investment they are speaking also change the text saving the numbers accurate to have less tautology constructed ass a report not a conversation",}],
            model="llama3-8b-8192",
        )
        applications_per_period_answer=(chat_completion.choices[0].message.content)

        chat_completion = client.chat.completions.create(
            messages=[{
                    "role": "user",
                    "content": applications_rate_per_period_answer + "based on that act like credit consultant and give me informed answer about the data and the applications RATE, for what investment they are speaking also change the text saving the numbers accurate to have less tautology constructed ass a report not a conversation",}],
            model="llama3-8b-8192",
        )
        applications_rate_per_period_answer=(chat_completion.choices[0].message.content)

        chat_completion = client.chat.completions.create(
            messages=[{
                    "role": "user",
                    "content": customer_behavior_per_period_answer + "based on that act like credit consultant and give me informed advises about the customer behaviour what tdoes it means and also changing the text saving the numbers accurate to have less tautology constructed ass a report not a conversation",}],
            model="llama3-8b-8192",
        )
        customer_behavior_per_period_answer=(chat_completion.choices[0].message.content)
        
        chat_completion = client.chat.completions.create(
            messages=[{
                    "role": "user",
                    "content": geo_report_answer + "based on that act like credit consultant and give me informed advises about the region and potential investment and changing the text saving the numbers accurate to have less tautology constructed ass a report not a conversation",}],
            model="llama3-8b-8192",
        )
        geo_report_answer=(chat_completion.choices[0].message.content)











        # Define the strings to be saved
        strings = [
            cashflow_per_period_answer,
            contract_per_period_answer ,
            applications_per_period_answer,
            applications_rate_per_period_answer ,
            customer_behavior_per_period_answer,
            geo_report_answer
        ]



        # Create a new text file
        with open("output.txt", "w") as f:
            # Write the strings to the file with Markdown formatting
            for i, s in enumerate(strings):
                f.write(f"### {i+1}. {s}\n")

        print('app.py finish')
        f = open("../views/public/csv_collection/flag.txt", "r")
        string = (f.read())
