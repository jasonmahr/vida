//
//  ViewController.swift
//  Vida
//
//  Created by Ryoya Ogishima on 11/12/16.
//  Copyright © 2016 YHack16. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    var gender = "male"
    var delta = 1
    var age = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        self.view.backgroundColor = UIColor.blue
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func in_button(_ sender: Any) {
        self.view.backgroundColor = UIColor.blue
        delta = 1
    }
    @IBAction func out_button(_ sender: Any) {
        self.view.backgroundColor = UIColor.red
        delta = -1
    }
    @IBAction func male_age0(_ sender: Any) {
        gender = "male"
        age = 0
        postAsync(sender: sender as AnyObject)
    }
    @IBAction func male_age1(_ sender: Any) {
        gender = "male"
        age = 1
        postAsync(sender: sender as AnyObject)
    }
    @IBAction func male_age2(_ sender: Any) {
        gender = "male"
        age = 2
        postAsync(sender: sender as AnyObject)
    }
    @IBAction func male_age3(_ sender: Any) {
        gender = "male"
        age = 3
        postAsync(sender: sender as AnyObject)
    }
    @IBAction func female_age0(_ sender: Any) {
        gender = "female"
        age = 0
        postAsync(sender: sender as AnyObject)
    }
    @IBAction func female_age1(_ sender: Any) {
        gender = "female"
        age = 1
        postAsync(sender: sender as AnyObject)
    }
    @IBAction func female_age2(_ sender: Any) {
        gender = "female"
        age = 2
        postAsync(sender: sender as AnyObject)
    }
    @IBAction func female_age3(_ sender: Any) {
        gender = "female"
        age = 3
        postAsync(sender: sender as AnyObject)
    }
    // prepare json data
    func postAsync(sender: AnyObject) {
        
        // create the url-request
        let urlString = "https://vida.herokuapp.com/api/update"
        let request = NSMutableURLRequest(url: NSURL(string: urlString)! as URL)
        
        // set the method(HTTP-POST)
        request.httpMethod = "POST"
        // set the header(s)
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // prepare json data
        let params = ["gender": gender, "delta": delta, "age": age] as [String : Any]
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: params)
        }catch _ as NSError{}
        
        // use NSURLSessionDataTask
        let task = URLSession.shared.dataTask(with: request as URLRequest, completionHandler: {data, response, error in
            if (error == nil) {
                let result = NSString(data: data!, encoding: String.Encoding.utf8.rawValue)!
                print(result)
            } else {
                print(error as Any)
            }
        })
        task.resume()
    }
}
