# Import the dependencies.
import numpy as np
import datetime as dt
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify
from flask_cors import CORS


#################################################
# Database Setup
#################################################
engine = create_engine("postgresql+psycopg2://postgres:password@localhost:5432/project-3")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(autoload_with=engine)

# Save references to each table
Ufos = Base.classes.ufos

# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
CORS(app)

print(Base.classes.keys())

#################################################
# Flask Routes
#################################################
@app.route("/")
def home():
    """How to use API documentation -- home"""
    return (
        f"<b>UFO sightings API - Project 3</b> <br/>"
        f"-----------------------------------------<br/>"
        f"<i>API DOCUMENTATION</i><br/>Available routes: <br/>"
        f"<br/>"
        f"To return all data, use this path:<br/>"
        f"/api/v1.0/all_data <br/>"
        f"<br/>"
        f"To return a JSON dictionary of all the coordinates included in the data set, use this path:<br/>"
        f"/api/v1.0/all_locations <br/>"
        f"<br/>"
        f"To return a JSON list of UFO sighting coordinates before the year 2000, use this path:<br/>"
        f"/api/v1.0/before2000 <br/>"
        f"<br/>"
        f"To return the entry of a specific ID, use this path:<br/>"
        f"/api/v1.0/id/[id] <br/>"
        f"<br/>"
        f"To return the number of entries and the average duration for a specific state, use this path:<br/>"
        f"/api/v1.0/state/[state abbreviation] <br/>"
        f"<br/>"
        f"To return the number of entries and the average duration for a specific city, use this path:<br/>"
        f"/api/v1.0/city/[city]/[state abbreviation] <br/>"
        f"<br/>"
        f"To return the number of entries and the average duration for a given year, use this path:<br/>"
        f"/api/v1.0/year/[year] <br/>"
        f"<br/>"
        f"To return a JSON list of all the sightings from a given month of a given year, use this path:<br/>"
        f"/api/v1.0/month-year/[month]/[year] <br/>"
        f"<br/>"
        f"To return a JSON list of all the sightings under a given duration (seconds), use this path:<br/>"
        f"/api/v1.0/duration/[duration] <br/>"
        f"<br/>"
        f"To return a JSON list of all the sightings which had the same descriptor, use this path:<br/>"
        f"/api/v1.0/shape/[descriptor] <br/>"
        f"<br/>"
        f"API by Andrew Prozorovsky"
    )

@app.route("/api/v1.0/all_data")
def all_data():
    """Return a JSON list of the dataset"""
    data = session.query(Ufos.id, Ufos.datetime, Ufos.city, Ufos.state, Ufos.shape, \
                         Ufos.duration_seconds, Ufos.latitude, Ufos.longitude, Ufos.comments).all()

    session.close()
    
    all_data = []
    for id, datetime, city, state, shape, duration_seconds, latitude, longitude, comments in data:
        data_dict = {}
        data_dict["id"] = id
        data_dict["datetime"] = datetime
        data_dict["city"] = city
        data_dict["state"] = state
        data_dict["shape"] = shape
        data_dict["duration_seconds"] = duration_seconds
        data_dict["latitude"] = latitude
        data_dict["longitude"] = longitude
        data_dict["comments"] = comments
        all_data.append(data_dict)

    return (jsonify(all_data))

@app.route("/api/v1.0/all_locations")
def all_locations():
    """Return a JSON list of UFO sighting coordinates from the dataset"""
    data = session.query(Ufos.id, Ufos.latitude, Ufos.longitude).all()

    session.close()
    
    all_coordinates = []
    for id, latitude, longitude in data:
        coords_dict = {}
        coords_dict["id"] = id
        coords_dict["latitude"] = latitude
        coords_dict["longitude"] = longitude
        all_coordinates.append(coords_dict)

    return (jsonify(all_coordinates))

@app.route("/api/v1.0/before2000")
def before2000():
    """Return a JSON list of UFO sighting coordinates before the year 2000"""
    data = session.query(Ufos.datetime, Ufos.id, Ufos.latitude, Ufos.longitude).filter(Ufos.datetime <= func.date("2000-01-01")).all()

    session.close()
    
    all_coordinates = []
    for datetime, id, latitude, longitude in data:
        coords_dict = {}
        coords_dict["datetime"] = datetime
        coords_dict["id"] = id
        coords_dict["latitude"] = latitude
        coords_dict["longitude"] = longitude
        all_coordinates.append(coords_dict)

    return (jsonify(all_coordinates))

@app.route("/api/v1.0/id/<id>")
def call_id(id):
    """Return the JSON entry by its entered ID"""
    
    data = session.query(Ufos.id, Ufos.datetime, Ufos.city, Ufos.state, Ufos.shape, \
                         Ufos.duration_seconds, Ufos.latitude, Ufos.longitude, Ufos.comments)\
                            .filter(Ufos.id == id).all()

    session.close()

    sighting = []
    for id, datetime, city, state, shape, duration_seconds, latitude, longitude, comments in data:
        data_dict = {}
        data_dict["id"] = id
        data_dict["datetime"] = datetime
        data_dict["city"] = city
        data_dict["state"] = state
        data_dict["shape"] = shape
        data_dict["duration_seconds"] = duration_seconds
        data_dict["latitude"] = latitude
        data_dict["longitude"] = longitude
        data_dict["comments"] = comments
        sighting.append(data_dict)

    return (jsonify(sighting))

@app.route("/api/v1.0/state/<state>")
def state(state):
    """Return the number of entries and the average duration for that state."""

    data = session.query(func.count(), func.avg(Ufos.duration_seconds)).filter(Ufos.state == state).all()

    session.close()

    state_aggs = []
    for count, avg in data:
        data_dict = {}
        data_dict["number of sightings"] = count
        data_dict["average duration"] = avg
        state_aggs.append(data_dict)

    return (jsonify(state_aggs))

@app.route("/api/v1.0/city/<city>/<state>")
def city(city, state):
    """Return the number of entries and the average duration for that city."""

    data = session.query(func.count(), func.avg(Ufos.duration_seconds)).filter(Ufos.state == state).filter(Ufos.city == city).all()

    session.close()

    city_aggs = []
    for count, avg in data:
        data_dict = {}
        data_dict["number of sightings"] = count
        data_dict["average duration"] = avg
        city_aggs.append(data_dict)

    return (jsonify(city_aggs))

@app.route("/api/v1.0/year/<year>")
def year(year):
    """Return the number of entries and the average duration for that year."""

    data = session.query(func.count(), func.avg(Ufos.duration_seconds)).filter(func.extract('year', Ufos.datetime) == year).all()
    
    session.close()

    year_aggs = []
    for count, avg in data:
        data_dict = {}
        data_dict["number of sightings"] = count
        data_dict["average duration"] = avg
        year_aggs.append(data_dict)

    return (jsonify(year_aggs))

@app.route("/api/v1.0/month-year/<month>/<year>")
def monthyear(month, year):
    """Return all entries for a certain month of a certain year."""

    data = session.query(Ufos.id, Ufos.datetime, Ufos.city, Ufos.state, Ufos.shape, \
                         Ufos.duration_seconds, Ufos.latitude, Ufos.longitude).\
                            filter(func.extract('year', Ufos.datetime) == year).\
                            filter(func.extract('month', Ufos.datetime) == month).all()
    
    session.close()

    monthyear_data = []
    for id, datetime, city, state, shape, duration_seconds, latitude, longitude in data:
        data_dict = {}
        data_dict["id"] = id
        data_dict["datetime"] = datetime
        data_dict["city"] = city
        data_dict["state"] = state
        data_dict["shape"] = shape
        data_dict["duration_seconds"] = duration_seconds
        data_dict["latitude"] = latitude
        data_dict["longitude"] = longitude
        monthyear_data.append(data_dict)

    return (jsonify(monthyear_data))

@app.route("/api/v1.0/duration/<duration>")
def duration(duration):
    """Return the entries under a certain encounter duration."""

    data = session.query(Ufos.id, Ufos.datetime, Ufos.city, Ufos.state, Ufos.shape, \
                         Ufos.duration_seconds, Ufos.latitude, Ufos.longitude).filter(Ufos.duration_seconds <= duration).all()
    
    session.close()

    duration_data = []
    for id, datetime, city, state, shape, duration_seconds, latitude, longitude in data:
        data_dict = {}
        data_dict["id"] = id
        data_dict["datetime"] = datetime
        data_dict["city"] = city
        data_dict["state"] = state
        data_dict["shape"] = shape
        data_dict["duration_seconds"] = duration_seconds
        data_dict["latitude"] = latitude
        data_dict["longitude"] = longitude
        duration_data.append(data_dict)

    return (jsonify(duration_data))

@app.route("/api/v1.0/shape/<shape>")
def shape(shape):
    """Return the entries according to a certain descriptor."""

    data = session.query(Ufos.id, Ufos.datetime, Ufos.city, Ufos.state, Ufos.shape, \
                         Ufos.duration_seconds, Ufos.latitude, Ufos.longitude, Ufos.comments).filter(Ufos.shape == shape).all()
    
    session.close()

    shape_data = []
    for id, datetime, city, state, shape, duration_seconds, latitude, longitude, comments in data:
        data_dict = {}
        data_dict["id"] = id
        data_dict["datetime"] = datetime
        data_dict["city"] = city
        data_dict["state"] = state
        data_dict["shape"] = shape
        data_dict["duration_seconds"] = duration_seconds
        data_dict["latitude"] = latitude
        data_dict["longitude"] = longitude
        data_dict["comments"] = comments
        shape_data.append(data_dict)

    return (jsonify(shape_data))

## Routes needed:
# UPDATE HOME ROUTE -- incorrect
# Route to return JSON between given time period

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True) 