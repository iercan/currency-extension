import logging
import redis
import urllib
import mysql.connector
from flask import Flask, request, jsonify
from bs4 import BeautifulSoup as Soup
redis_conn = redis.Redis(host='redis', port='6379', db=0)
app = Flask(__name__)
TTL = 1800
CURRENCY_URL = 'https://www.investingwidgets.com/live-currency-cross-rates?pairs={}'


def get_db_connection():
    # Replace these with your actual database connection details
    db_config = {
        'user': 'root',
        'password': 'root',
        'host': 'mysql',
        'database': 'investing'
        }
    return mysql.connector.connect(**db_config)


@app.route('/select2', methods=['POST'])
def search():

    # Get parameters from the request
    search_term = request.json.get('search', '')
    page = int(request.json.get('page', 1))
    currency_type = request.json.get('type', 'currency')

    page_size = 100
    offset = (page - 1) * page_size

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # SQL query for default streams
    search_sql = "SELECT id, name FROM currencies WHERE name LIKE %s AND type = %s LIMIT %s OFFSET %s"
    cursor.execute(search_sql, (f"%{search_term}%", currency_type, page_size, offset))

    # Fetch all matching records
    results = cursor.fetchall()

    # Prepare the response for Select2
    response = {
            'results': [{'id': row['id'], 'text': row['name']} for row in results],
            'pagination': {'more':  page_size == len(results)}
            }

    # Close the database connection
    cursor.close()
    conn.close()


    # Return the results as JSON
    return jsonify(response)


@app.route('/')
def currencies():  # put application's code here
    ret_json = {}
    pairs = request.args.get('pairs')
    if not pairs:
        return jsonify({'error': 'Currency pairs should be provided'}), 400

    retrieve = []
    for curr_id in pairs.split(','):
        try:
            int(curr_id)
        except ValueError:
            return jsonify({'error': 'Bad params'}), 400

        val = redis_conn.get(curr_id)
        if val:
            val = val.decode('utf-8')
            name = val.split(':')[0]
            rate = val.split(':')[1]
            percentage = val.split(':')[2]
            ret_json[curr_id] = {
                'name': name,
                'rate': rate,
                'percentage': percentage
            }
        else:
            retrieve.append(curr_id)

    if retrieve:
        try:
            uri = CURRENCY_URL.format(','.join(retrieve))
            hdr = {'User-Agent': "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"}
            app.logger.info("Sending request to {}".format(uri))
            req = urllib.request.Request(uri, headers=hdr)
            html = urllib.request.urlopen(req)
            soup = Soup(html, features='html.parser')

        except Exception as e:
            app.logger.info(str(e))
            return jsonify({'error': 'Could not retrieve data from investing'}), 400
        for curr_id in retrieve:
            try:
                percentage = float(soup.select('.pid-{}-pcp'.format(curr_id))[0].get_text().replace('%', ''))
                name = soup.select('#pair_{} .js-col-pair_name a'.format(curr_id))[0].get_text()
                rate = soup.select('.pid-{}-bid'.format(curr_id))[0].get_text()
                redis_conn.set(curr_id, '{}:{}:{}'.format(name, rate, percentage), ex=TTL)
                ret_json[curr_id] = {
                    'name': name,
                    'rate': rate,
                    'percentage': percentage
                }
            except:
                ret_json[curr_id] = {'name': None, 'rate': None, 'percentage': None}
    return jsonify(ret_json)

gunicorn_logger = logging.getLogger('gunicorn.error')
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(gunicorn_logger.level)

if __name__ == '__main__':
    app.run()
