import React, { useState } from 'react';
import axios from 'axios';
import { cities } from './cities';
import { Input, AutoComplete, Button, Alert } from 'antd';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

const Home = () => {
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [displayArray, setDisplayArray] = useState(() => {
        const savedData = localStorage.getItem('weatherDetails');
        return savedData ? JSON.parse(savedData) : [];
    });

    const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

    const fetchWeatherData = async () => {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${selectedCity.latitude}&lon=${selectedCity.longitude}&units=metric&appid=${API_KEY}`);
            const cityWeather = {
                ...response.data,
                city: selectedCity.city
            };
            const newWeatherArray = [...displayArray, cityWeather];
            setDisplayArray(newWeatherArray);
            localStorage.setItem('weatherDetails', JSON.stringify(newWeatherArray));
        } catch (err) {
            setError(err);
        }
    };

    const handleSearch = (value) => {
        if (value) {
            setInputValue(value);
            const filteredCities = cities
                .filter(cityObj => cityObj.city.toLowerCase().includes(value.toLowerCase()))
                .map(cityObj => ({
                    value: cityObj.city,
                    label: cityObj.city,
                    cityObj
                }));
            setOptions(filteredCities);
            setError('');

        } else {
            setOptions([]);
        }
    };

    const handleSelect = (value, option) => {
        const selected = option.cityObj;
        setSelectedCity(selected);
        setInputValue(value);

    };

    const handleSubmit = () => {
        setIsSubmitting(true);

        if (!selectedCity) {
            setError('Please select a valid city.');
            setIsSubmitting(false);

            return;
        }
        setInputValue('');
        fetchWeatherData();
        setSelectedCity(null)
        setIsSubmitting(false);

    };

    const handleDelete = (index) => {
        const updatedArray = displayArray.filter((_, i) => i !== index);
        setDisplayArray(updatedArray);
        localStorage.setItem('weatherDetails', JSON.stringify(updatedArray));
    };


    const CustomLeftArrow = ({ onClick }) => {
        return (
            <button
                className="absolute  left-[-8px] top-1/2 transform -translate-y-1/2 text-black bg-transparent rounded-full z-50"
                onClick={onClick}
            >
                <MdNavigateBefore size={24} />
            </button>
        );
    };

    const CustomRightArrow = ({ onClick }) => {
        return (
            <button
                className="absolute  right-[-8px] top-1/2 transform -translate-y-1/2 text-black bg-transparent rounded-full"
                onClick={onClick}
            >
                <MdNavigateNext size={24} />
            </button>
        );
    };

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };

    return (
        <>
            <div className='flex flex-col mt-4 bg-white max-w-md mx-auto p-4 rounded-lg shadow-lg text-center'>
                <h2 className='font-bold text-start text-[20px]'>Weather updates</h2>
                {error && (
                    <Alert message={error} type="error" showIcon className="mb-4" />
                )}
                <AutoComplete
                    options={options}
                    onSearch={handleSearch}
                    onSelect={handleSelect}
                    placeholder="Search city"
                    value={inputValue}
                    onChange={setInputValue}
                    className='text-start mt-8'
                >
                    <Input />
                </AutoComplete>

                <Button className='w-[20%] mt-4' loading={isSubmitting}
                    type="primary" onClick={handleSubmit}>Submit</Button>
            </div>

            <div className='mt-10 '>
                {displayArray.length !== 0 ? (
                    <Carousel
                        className='w-[90%] mx-auto '
                        responsive={responsive}
                        infinite={true}
                        customLeftArrow={<CustomLeftArrow />}
                        customRightArrow={<CustomRightArrow />}
                        autoPlay={true}
                    >
                        {displayArray.map((weather, index) => {
                            return (
                                <div key={index} className="p-4 bg-[#ffce71] rounded-lg  text-start mb-4 mr-2 ml-2">
                                    <h1 className="text-2xl font-bold mb-4">Weather in {weather.city}</h1>
                                    <div className="flex items-center justify-start">
                                        <img
                                            src={`http://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`}
                                            alt="Weather Icon"
                                        />
                                        <div className="ml-4 text-left">
                                            <h2 className="text-xl font-semibold mb-2">{weather.current.weather[0].description}</h2>
                                            <p className="text-lg">Temperature: {weather.current.temp}°C</p>
                                            <p className="text-lg">Humidity: {weather.current.humidity}%</p>
                                        </div>
                                    </div>
                                    <div className='flex justify-end'>
                                        <Button className="mt-4" type="primary" danger onClick={() => handleDelete(index)}>Delete</Button>
                                    </div>
                                </div>
                            )
                        })}
                    </Carousel>
                ) : (
                    <div className='font-bold  text-[20px]'>No data to show</div>
                )}

            </div>
        </>
    );
};

export default Home;
