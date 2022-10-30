from flask import Flask, request, jsonify
import redis
from bs4 import BeautifulSoup as Soup
import urllib
redis_conn = redis.Redis(host='redis', port='6379', db=0)
app = Flask(__name__)
TTL = 600
CURRENCY_URL = 'https://www.investingwidgets.com/live-currency-cross-rates?roundedCorners=true&theme=darkTheme&hideTitle=true&pairs={}'

@app.route('/')
def currencies():  # put application's code here
    ret_json = {}
    pairs = request.args.get("pairs")
    if not pairs:
        return jsonify({'error': 'Currency pairs should be provided'}), 400
    retrieve = []
    for curr_id in pairs.split(','):
        val = redis_conn.get(curr_id)
        if val:
            val = val.decode("utf-8")
            name = val.split(':')[0]
            rate = val.split(':')[1]
            percentage = val.split(':')[2]
            ret_json[curr_id] = {
                "name": name,
                "rate": rate,
                "percentage": percentage
            }
        else:
            retrieve.append(curr_id)

    if retrieve:
        html = urllib.request.urlopen(CURRENCY_URL.format(','.join(retrieve)))
        soup = Soup(html, features="html.parser")
        for curr_id in retrieve:
            try:
                percentage = float(soup.select(".pid-{}-pcp".format(curr_id))[0].get_text().replace('%', ''))
                name = soup.select('#pair_{} .js-col-pair_name a'.format(curr_id))[0].get_text()
                rate = soup.select(".pid-{}-bid".format(curr_id))[0].get_text()
                redis_conn.set(curr_id, '{}:{}:{}'.format(name, rate, percentage), ex=TTL)
                ret_json[curr_id] = {
                    "name": name,
                    "rate": rate,
                    "percentage": percentage
                }
            except:
                ret_json[curr_id] = {"name": None, "rate": None, "percentage": None}
    return jsonify(ret_json)


if __name__ == '__main__':
    app.run()
